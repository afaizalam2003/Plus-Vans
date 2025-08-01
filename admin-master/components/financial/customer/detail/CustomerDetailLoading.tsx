import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Waste Removal Solutions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get instant AI-powered quotes for your waste removal needs.
            Professional, eco-friendly, and hassle-free service.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/quote">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Instant Quote
              </Button>
            </Link>
            <Link to="/admin">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Admin Dashboard
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-4">Upload Photos</h3>
              <p className="text-gray-600">
                Simply take photos of your waste items and upload them through
                our easy-to-use form
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your photos and provides accurate waste
                identification and pricing
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-4">Instant Quote</h3>
              <p className="text-gray-600">
                Receive your detailed quote within minutes and book your
                collection online
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
