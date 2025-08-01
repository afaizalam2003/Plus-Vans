from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.schema.messages import HumanMessage, AIMessage
from langchain_chroma import Chroma
from langchain.retrievers.multi_vector import MultiVectorRetriever
from langchain.storage import InMemoryStore
from langchain.schema.document import Document
import base64
from dotenv import load_dotenv
from app import schemas
from app.schemas import EstimationRule
from app.supabase import get_supabase, SupabaseError
from loguru import logger
from typing import Dict, Any, List
from decimal import Decimal
from pydantic import BaseModel
import json
import os

# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


class AIAnalysisResponse(BaseModel):
    """Structured response from AI analysis"""
    volume: float
    material_hazard_risk: float
    access_difficulty: float
    base_cost_estimate: float
    hazard_surcharge: float
    access_fee: float
    dismantling_fee: float
    special_handling_requirements: List[str]
    confidence_score: float


class QuoteEstimationAgent:
    """Agent for estimating quotes based on images and booking details using GPT-4V."""

    def __init__(self):
        """Initialize the quote estimation agent with required models and stores."""
        logger.info("Initializing QuoteEstimationAgent")
        self.gpt4_vision = ChatOpenAI(
            model="gpt-4o-mini",
            max_tokens=4096,
            openai_api_key=OPENAI_API_KEY
        )
        self.vectorstore = Chroma(
            collection_name="estimation_rules",
            embedding_function=OpenAIEmbeddings(
                openai_api_key=OPENAI_API_KEY,
                model="text-embedding-3-large"
            ),
            persist_directory="db/estimation_rules"
        )
        self.store = InMemoryStore()
        self.retriever = MultiVectorRetriever(
            vectorstore=self.vectorstore,
            docstore=self.store,
            id_key="rule_id"
        )

        # Only ingest rules if estimation_rules directory doesn't exist
        if not os.path.exists("db/estimation_rules"):
            self._ingest_rules()
            logger.info("Rules ingested successfully")
        else:
            logger.info("Estimation rules already exist, skipping ingestion")

    def _ingest_rules(self) -> None:
        """Ingest estimation rules from database into vector store."""
        logger.info("Starting rules ingestion")

        try:
            # Get active rules from Supabase
            supabase = get_supabase(use_admin=True)
            rules_data = supabase.table('estimation_rules').select(
                '*').eq('active', True).execute()

            if not rules_data.data:
                logger.warning("No active rules found in database")
                return

            rules = [EstimationRule(**rule) for rule in rules_data.data]

            logger.debug(f"Found {len(rules)} active rules")

            for rule in rules:
                # Convert rule to document format and filter out None values
                rule_dict = {
                    "rule_id": rule.id,
                    "rule_name": rule.rule_name,
                    "rule_description": rule.rule_description,
                    "rule_type": rule.rule_type,
                    "min_value": float(rule.min_value) if rule.min_value is not None else 0.0,
                    "max_value": float(rule.max_value) if rule.max_value is not None else 0.0,
                    "multiplier": float(rule.multiplier),
                    "currency": rule.currency or "USD",  # Provide default value
                    "postcode_prefix": rule.postcode_prefix or "",  # Convert None to empty string
                    "base_rate": float(rule.base_rate) if rule.base_rate is not None else 0.0,
                    "hazard_surcharge": float(rule.hazard_surcharge) if rule.hazard_surcharge is not None else 0.0,
                    "access_fee": float(rule.access_fee) if rule.access_fee is not None else 0.0,
                    "dismantling_fee": float(rule.dismantling_fee) if rule.dismantling_fee is not None else 0.0
                }

                # Create document for vector store
                doc = Document(
                    page_content=f"{rule.rule_name}: {rule.rule_description}",
                    metadata=rule_dict
                )

                # Add to retriever
                self.vectorstore.add_documents([doc])
                self.store.mset([(rule.id, doc)])
                logger.debug(f"Ingested rule: {rule.rule_name}")

        except SupabaseError as e:
            logger.error(f"Failed to fetch rules from Supabase: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during rules ingestion: {str(e)}")
            raise

        logger.info("Rules ingestion completed")

    def encode_image(self, image_url: str) -> str:
        """
        Download image from URL and encode it to base64.

        Args:
            image_url: URL of the image to encode

        Returns:
            str: Base64 encoded image string

        Raises:
            Exception: If image download or encoding fails
        """
        logger.debug(f"Encoding image from {image_url}")
        try:
            import requests
            import os
            from pathlib import Path

            # Create downloads directory if it doesn't exist
            downloads_dir = Path("downloads")
            downloads_dir.mkdir(exist_ok=True)

            # Download the image with timeout
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()

            # Generate filename from URL
            filename = os.path.join("downloads", os.path.basename(image_url))

            # Save the image
            with open(filename, "wb") as f:
                f.write(response.content)

            # Encode the downloaded image
            with open(filename, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image: {str(e)}")
            raise

    def _get_relevant_rules_context(self, booking_details: Dict[str, Any]) -> str:
        """
        Retrieve relevant rules and context from the vector store using the new invoke method.

        Args:
            booking_details: Dictionary containing booking information

        Returns:
            str: Formatted context from relevant rules
        """
        # Search for relevant rules based on booking details
        search_text = f"""
        Waste removal booking in {booking_details['postcode']}
        Location: {booking_details['location']}
        Access restricted: {booking_details['access_restricted']}
        Dismantling needed: {booking_details['dismantling_required']}
        """

        # Use the new invoke method instead of get_relevant_documents
        relevant_docs = self.retriever.invoke(search_text)

        # Format context from relevant rules
        context = "Relevant estimation guidelines:\n"
        for doc in relevant_docs:
            context += f"- {doc.page_content}\n"
            context += f"  Base rate: £{doc.metadata['base_rate']}\n"
            context += f"  Typical hazard surcharge: £{doc.metadata['hazard_surcharge']}\n"
            if doc.metadata['access_fee']:
                context += f"  Standard access fee: £{doc.metadata['access_fee']}\n"
            if doc.metadata['dismantling_fee']:
                context += f"  Standard dismantling fee: £{doc.metadata['dismantling_fee']}\n"

        return context

    def analyze_booking(self, booking_id: str) -> Dict[str, Any]:
        """
        Analyze booking details, customer info, and media uploads to generate a quote.
        Uses RAG to provide relevant context to the AI for more accurate estimations.

        Args:
            booking_id: ID of the booking to analyze

        Returns:
            Dict containing quote breakdown and compliance info

        Raises:
            ValueError: If booking not found or required data missing
            SupabaseError: If database operations fail
        """
        logger.info(f"Starting analysis for booking {booking_id}")

        try:
            # Get booking with all related data from Supabase
            supabase = get_supabase(use_admin=True)
            booking_result = supabase.table('bookings').select(
                '*').eq('id', booking_id).execute()

            if not booking_result.data:
                logger.error(f"Booking {booking_id} not found")
                raise ValueError(f"Booking {booking_id} not found")

            booking = schemas.BookingCreate(**booking_result.data[0])

            # Get media uploads
            media_result = supabase.table('media_uploads').select(
                '*').eq('booking_id', booking_id).execute()

            if not media_result.data:
                logger.error(
                    f"No media uploads found for booking {booking_id}")
                raise ValueError("Media uploads required for analysis")

            media_uploads = [schemas.MediaUploadRequest(
                **media) for media in media_result.data]

            # Get customer details
            customer_result = supabase.table('customer_details').select(
                '*').eq('booking_id', booking_id).execute()
            customer = schemas.CustomerDetails(
                **customer_result.data[0]) if customer_result.data else None

            # Get applicable estimation rules
            rules_result = supabase.table('estimation_rules').select(
                '*').eq('active', True).like('postcode_prefix', f"{booking.postcode[:3]}%").execute()
            postcode_rules = [EstimationRule(**rule)
                              for rule in rules_result.data]

            # Analyze images with GPT-4V
            image_prompts = []
            for media in media_uploads:
                # Process each image URL in the array
                for image_url in media.image_urls:
                    encoded_image = self.encode_image(image_url)
                    image_prompts.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{encoded_image}"
                        }
                    })

            # Get relevant context from vector store
            booking_details = {
                "postcode": booking.postcode,
                "location": media_uploads[0].waste_location,
                "access_restricted": media_uploads[0].access_restricted,
                "dismantling_required": media_uploads[0].dismantling_required
            }
            relevant_context = self._get_relevant_rules_context(
                booking_details)

            # Build enhanced prompt with explicit JSON structure
            prompt = [
                AIMessage(
                    content="You are an expert waste removal cost estimator. Respond only with valid JSON."),
                HumanMessage(content=[
                    {"type": "text", "text": f"""
                    Analyze these images and details to generate a quote estimation. 
                    Respond with a JSON object using this exact structure:
                    {{
                        "volume": "number in cubic yards",
                        "material_hazard_risk": "number between 0-1",
                        "access_difficulty": "number between 0-1",
                        "base_cost_estimate": "number in GBP",
                        "hazard_surcharge": "number in GBP",
                        "access_fee": "number in GBP",
                        "dismantling_fee": "number in GBP",
                        "special_handling_requirements": ["requirement1", "requirement2"],
                        "confidence_score": "number between 0-1"
                    }}

                    Context and details:
                    {relevant_context}
                    
                    Location: {media_uploads[0].waste_location}
                    Access restricted: {media_uploads[0].access_restricted}
                    Dismantling needed: {media_uploads[0].dismantling_required}
                    Postcode: {booking.postcode}
                    Address: {booking.address}
                    
                    """},
                    *image_prompts
                ])
            ]

            # Get AI analysis with better error handling
            logger.info("Getting AI analysis")
            response = self.gpt4_vision.invoke(prompt)

            try:
                # Log the raw response for debugging
                logger.debug(f"Raw AI response: {response.content}")

                # Clean the response string
                cleaned_response = response.content.strip()
                if cleaned_response.startswith("```json"):
                    cleaned_response = cleaned_response.replace(
                        "```json", "").replace("```", "").strip()

                # Parse the cleaned JSON and validate with Pydantic model
                ai_analysis = AIAnalysisResponse(
                    **json.loads(cleaned_response))

                # Extract AI-determined values
                ai_base_rate = Decimal(str(ai_analysis.base_cost_estimate))
                ai_hazard_surcharge = Decimal(
                    str(ai_analysis.hazard_surcharge))
                ai_access_fee = Decimal(str(ai_analysis.access_fee))
                ai_dismantling_fee = Decimal(str(ai_analysis.dismantling_fee))
                material_risk = ai_analysis.material_hazard_risk
                access_difficulty = ai_analysis.access_difficulty
                volume = ai_analysis.volume

            except json.JSONDecodeError as e:
                logger.error(f"JSON parsing error: {str(e)}")
                logger.error(f"Failed response content: {response.content}")
                raise ValueError(f"Invalid JSON response from AI: {str(e)}")
            except (KeyError, ValueError) as e:
                logger.error(f"Error processing AI response: {str(e)}")
                raise ValueError(f"Error processing AI response: {str(e)}")
            except Exception as e:
                logger.error(f"Unexpected error: {str(e)}")
                raise ValueError(
                    f"Unexpected error processing AI response: {str(e)}")

            # Apply rules as minor adjustments (10% influence)
            # Rules influence 10% of final price
            adjustment_factor = Decimal('0.1')

            for rule in postcode_rules:
                if rule.rule_type == "base_rate_adjustment":
                    ai_base_rate += (Decimal(str(rule.base_rate))
                                     * adjustment_factor)
                elif rule.rule_type == "hazard_multiplier" and material_risk > 0.3:
                    ai_hazard_surcharge += (
                        Decimal(str(rule.hazard_surcharge or '0.00')) * adjustment_factor)

                # Apply minimal rule-based adjustments to fees
                if media_uploads[0].access_restricted and rule.access_fee:
                    ai_access_fee += (Decimal(str(rule.access_fee))
                                      * adjustment_factor)
                if media_uploads[0].dismantling_required and rule.dismantling_fee:
                    ai_dismantling_fee += (Decimal(str(rule.dismantling_fee))
                                           * adjustment_factor)

            # Calculate total price
            total_price = float(
                ai_base_rate + ai_hazard_surcharge + ai_access_fee + ai_dismantling_fee)

            # Build response dictionary matching the TypeScript interface and Pydantic models
            response_dict = {
                "breakdown": {
                    "volume": str(volume),
                    "material_risk": material_risk,
                    "postcode": booking.postcode,
                    "price_components": {
                        "base_rate": float(ai_base_rate),
                        "hazard_surcharge": float(ai_hazard_surcharge),
                        "access_fee": float(ai_access_fee),
                        "dismantling_fee": float(ai_dismantling_fee),
                        "total": total_price
                    }
                },
                "compliance": ai_analysis.special_handling_requirements,
                "explanation": {
                    "heatmapUrl": None,
                    "similarCases": [],
                    "applied_rules": [
                        {
                            "rule_id": rule.id,
                            "rule_name": rule.rule_name,
                            "rule_type": rule.rule_type,
                            "applied_adjustment": float(rule.multiplier)
                        }
                        for rule in postcode_rules
                    ]
                }
            }

            # Update booking with quote in Supabase
            update_result = supabase.table('bookings').update(
                {"quote": response_dict}
            ).eq('id', booking_id).execute()

            if not update_result.data:
                logger.error("Failed to update booking with quote")
                raise SupabaseError("Failed to update booking with quote")

            return response_dict

        except SupabaseError as e:
            logger.error(f"Database error during analysis: {str(e)}")
            raise
        except ValueError as e:
            logger.error(f"Validation error during analysis: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during analysis: {str(e)}")
            raise
