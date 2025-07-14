"use client"

import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { X, UploadCloud } from "lucide-react"

// For YAML parsing
import yaml from "js-yaml"

export default function AddApiForm({ onSave, onCancel, initial }) {
  const [openapiSpec, setOpenapiSpec] = useState(null)
  const [fileError, setFileError] = useState("")
  const [availablePaths, setAvailablePaths] = useState([])
  const [selectedPath, setSelectedPath] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")
  const [endpointInfo, setEndpointInfo] = useState({}) // { name, endpoint, method, description, ... }

  // For extra fields/edits
  const [version, setVersion] = useState("1.0.0")
  const [status, setStatus] = useState("active")
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState("")

  // For manual OpenAPI paste
  const [openapiRaw, setOpenapiRaw] = useState("")

  // If editing, set fields from initial
  useEffect(() => {
    if (initial) {
      setEndpointInfo({
        name: initial.name || "",
        endpoint: initial.endpoint || "",
        method: initial.method || "GET",
        description: initial.description || ""
      })
      setVersion(initial.version || "1.0.0")
      setStatus(initial.status || "active")
      setTags(initial.tags || [])
      setOpenapiSpec(initial.openapiSpec || null)
      setOpenapiRaw(initial.openapiSpec ? JSON.stringify(initial.openapiSpec, null, 2) : "")
      setAvailablePaths([])
      setSelectedPath("")
      setSelectedMethod("")
    } else {
      setEndpointInfo({})
      setVersion("1.0.0")
      setStatus("active")
      setTags([])
      setOpenapiSpec(null)
      setOpenapiRaw("")
      setAvailablePaths([])
      setSelectedPath("")
      setSelectedMethod("")
    }
  }, [initial])

  // Parse OpenAPI file
  const handleFileUpload = async (e) => {
    setFileError("")
    setAvailablePaths([])
    setSelectedPath("")
    setSelectedMethod("")
    setOpenapiSpec(null)
    const file = e.target.files[0]
    if (!file) return

    const ext = file.name.split(".").pop().toLowerCase()
    const text = await file.text()
    try {
      let spec
      if (ext === "json") {
        spec = JSON.parse(text)
      } else if (ext === "yaml" || ext === "yml") {
        spec = yaml.load(text)
      } else {
        setFileError("Only JSON or YAML files are supported")
        return
      }
      setOpenapiSpec(spec)
      setOpenapiRaw(JSON.stringify(spec, null, 2))
      // Extract endpoints
      const allPaths = []
      if (spec.paths) {
        Object.keys(spec.paths).forEach(path => {
          Object.keys(spec.paths[path]).forEach(method => {
            allPaths.push({
              path,
              method: method.toUpperCase(),
              summary: spec.paths[path][method].summary || "",
              description: spec.paths[path][method].description || "",
              operation: spec.paths[path][method]
            })
          })
        })
      }
      setAvailablePaths(allPaths)
    } catch (err) {
      setFileError("Failed to parse OpenAPI file: " + err.message)
    }
  }

  // When user selects endpoint/method from OpenAPI, autofill
  useEffect(() => {
    if (selectedPath && selectedMethod) {
      const endpointObj = availablePaths.find(
        (ep) => ep.path === selectedPath && ep.method === selectedMethod
      )
      if (endpointObj) {
        setEndpointInfo({
          name: endpointObj.summary || endpointObj.operation.operationId || `${selectedMethod} ${selectedPath}`,
          endpoint: endpointObj.path,
          method: endpointObj.method,
          description: endpointObj.description || endpointObj.summary || ""
        })
      }
    }
  }, [selectedPath, selectedMethod, availablePaths])

  // Tag helpers
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Manual OpenAPI paste
  const handleOpenapiPaste = (val) => {
    setOpenapiRaw(val)
    setFileError("")
    setAvailablePaths([])
    setSelectedPath("")
    setSelectedMethod("")
    setOpenapiSpec(null)
    try {
      const spec = JSON.parse(val)
      setOpenapiSpec(spec)
      // Extract endpoints as above
      const allPaths = []
      if (spec.paths) {
        Object.keys(spec.paths).forEach(path => {
          Object.keys(spec.paths[path]).forEach(method => {
            allPaths.push({
              path,
              method: method.toUpperCase(),
              summary: spec.paths[path][method].summary || "",
              description: spec.paths[path][method].description || "",
              operation: spec.paths[path][method]
            })
          })
        })
      }
      setAvailablePaths(allPaths)
    } catch (err) {
      setFileError("Paste a valid OpenAPI JSON!")
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Always save OpenAPI spec and endpoint info
    onSave({
      name: endpointInfo.name,
      endpoint: endpointInfo.endpoint,
      method: endpointInfo.method,
      description: endpointInfo.description,
      version,
      status,
      tags,
      openapiSpec,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File upload */}
      <div className="space-y-2">
        <Label>Upload OpenAPI File (.json, .yaml, .yml)</Label>
        <Input type="file" accept=".json,.yaml,.yml" onChange={handleFileUpload} />
        {fileError && <div className="text-red-600 text-xs mt-1">{fileError}</div>}
      </div>

      {/* OR manual paste */}
      <div className="space-y-2">
        <Label>Or paste OpenAPI JSON</Label>
        <Textarea
          placeholder="Paste OpenAPI JSON here..."
          value={openapiRaw}
          onChange={(e) => handleOpenapiPaste(e.target.value)}
          rows={6}
          className="font-mono text-xs"
        />
      </div>

      {/* List endpoints for selection if availablePaths found */}
      {availablePaths.length > 0 && (
        <div className="space-y-2">
          <Label>Select API Endpoint</Label>
          <div className="flex gap-2">
            <Select value={selectedPath} onValueChange={setSelectedPath}>
              <SelectTrigger className="w-1/2"><SelectValue placeholder="Endpoint" /></SelectTrigger>
              <SelectContent>
                {[...new Set(availablePaths.map(ep => ep.path))].map(path => (
                  <SelectItem key={path} value={path}>{path}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-1/2"><SelectValue placeholder="Method" /></SelectTrigger>
              <SelectContent>
                {[...new Set(
                  availablePaths
                    .filter(ep => !selectedPath || ep.path === selectedPath)
                    .map(ep => ep.method)
                )].map(method => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* API fields (autofilled, but editable) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>API Name</Label>
          <Input
            placeholder="Enter API name"
            value={endpointInfo.name || ""}
            onChange={e => setEndpointInfo({ ...endpointInfo, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Method</Label>
          <Input
            value={endpointInfo.method || ""}
            readOnly
            className="bg-gray-100"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Endpoint</Label>
        <Input
          placeholder="/api/v1/resource"
          value={endpointInfo.endpoint || ""}
          readOnly
          className="bg-gray-100"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Enter API description"
          value={endpointInfo.description || ""}
          onChange={e => setEndpointInfo({ ...endpointInfo, description: e.target.value })}
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Version</Label>
          <Input placeholder="1.0.0" value={version} onChange={e => setVersion(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
              <SelectItem value="beta">Beta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Add tag"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
              <span>{tag}</span>
              <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Update" : "Create"} API</Button>
      </div>
    </form>
  )
}
