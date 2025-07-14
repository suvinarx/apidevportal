import { useState } from "react";
import TestApiForm from "./TestApiForm";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDetail({ api, onBack }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(api.endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button onClick={onBack} className="mb-4 text-blue-700 hover:underline">&larr; Back to APIs</button>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-2xl font-bold mb-2">{api.name}</h3>
        <div className="mb-2 text-gray-600">{api.description}</div>
        <div className="mb-2 text-xs text-gray-500 flex items-center">
          <strong>Endpoint:</strong>&nbsp;
          <span className="font-mono">{api.method} {api.endpoint}</span>
          <button onClick={handleCopy} className="ml-2 px-2 py-1 text-xs bg-blue-100 rounded">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {/* ...status, version, tags... */}
      </div>
      {api.openapiSpec && Object.keys(api.openapiSpec).length > 0 && (
        <div className="my-8 bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">API Documentation (OpenAPI)</h4>
          <SwaggerUI spec={api.openapiSpec} />
        </div>
      )}
      <div className="mt-6">
        <TestApiForm apiId={api._id} />
      </div>
    </div>
  );
}
