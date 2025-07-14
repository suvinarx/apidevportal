"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Play, Copy, Download } from "lucide-react"
import { testApi } from "../api"

export default function TestApiForm({ apiId }) {
  const [baseUrl, setBaseUrl] = useState("https://api.example.com")
  const [headers, setHeaders] = useState(`{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}`)
  const [body, setBody] = useState(`{
  "example": "data"
}`)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [responseTime, setResponseTime] = useState(null)

  const handleTest = async (e) => {
    e.preventDefault()
    setError("")
    setResponse(null)
    setLoading(true)

    const startTime = Date.now()

    try {
      let parsedBody
      try {
        parsedBody = JSON.parse(body)
      } catch {
        setError("Request body must be valid JSON.")
        setLoading(false)
        return
      }

      const res = await testApi(apiId, parsedBody)
      const endTime = Date.now()
      setResponseTime(endTime - startTime)
      setResponse({
        status: 200,
        statusText: "OK",
        headers: {
          "content-type": "application/json",
          "x-response-time": `${endTime - startTime}ms`,
        },
        data: res.data,
      })
    } catch (err) {
      setError("Failed to test API")
    }
    setLoading(false)
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
    }
  }

  return (
    <div className="space-y-6">
      {/* Request Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Request Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base-url">Base URL</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <Tabs defaultValue="headers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
            </TabsList>
            <TabsContent value="headers" className="mt-4">
              <Textarea
                placeholder="Request headers (JSON)"
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="body" className="mt-4">
              <Textarea
                placeholder="Request body (JSON)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </TabsContent>
          </Tabs>

          <Button onClick={handleTest} disabled={loading} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="text-red-600 text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Response */}
      {(response || loading) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Response</CardTitle>
              {response && (
                <div className="flex items-center space-x-2">
                  <Badge variant={response.status < 300 ? "default" : "destructive"}>
                    {response.status} {response.statusText}
                  </Badge>
                  {responseTime && <Badge variant="outline">{responseTime}ms</Badge>}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Response Headers */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Headers</Label>
                  <pre className="mt-1 bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>
                {/* Response Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Body</Label>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={copyResponse}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
