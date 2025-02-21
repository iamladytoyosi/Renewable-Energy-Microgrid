import { describe, it, beforeEach, expect } from "vitest"

describe("Grid Balancing Contract", () => {
  let mockStorage: Map<string, any>
  const CONTRACT_OWNER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  
  beforeEach(() => {
    mockStorage = new Map()
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "update-grid-status":
        if (sender !== CONTRACT_OWNER) {
          return { success: false, error: "ERR_NOT_AUTHORIZED" }
        }
        const [totalProduction, totalConsumption] = args
        const balance = totalProduction - totalConsumption
        const timestamp = Date.now()
        mockStorage.set(`grid-status-${timestamp}`, {
          "total-production": totalProduction,
          "total-consumption": totalConsumption,
          balance,
        })
        return { success: true }
      
      case "get-grid-status":
        const [getTimestamp] = args
        return { success: true, value: mockStorage.get(`grid-status-${getTimestamp}`) }
      
      case "get-latest-grid-status":
        const latestTimestamp = Math.max(
            ...Array.from(mockStorage.keys()).map((key) => Number.parseInt(key.split("-")[2])),
        )
        return { success: true, value: mockStorage.get(`grid-status-${latestTimestamp}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should update grid status", () => {
    const result = mockContractCall("update-grid-status", [1000, 800], CONTRACT_OWNER)
    expect(result.success).toBe(true)
  })
  
  it("should not update grid status if not contract owner", () => {
    const result = mockContractCall("update-grid-status", [1000, 800], "unauthorized")
    expect(result.success).toBe(false)
    expect(result.error).toBe("ERR_NOT_AUTHORIZED")
  })
  
  it("should get grid status", () => {
    mockContractCall("update-grid-status", [1000, 800], CONTRACT_OWNER)
    const timestamp = Date.now()
    const result = mockContractCall("get-grid-status", [timestamp], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      "total-production": 1000,
      "total-consumption": 800,
      balance: 200,
    })
  })
  
  it("should get latest grid status", () => {
    mockContractCall("update-grid-status", [1000, 800], CONTRACT_OWNER)
    mockContractCall("update-grid-status", [1200, 1000], CONTRACT_OWNER)
    const result = mockContractCall("get-latest-grid-status", [], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      "total-production": 1200,
      "total-consumption": 1000,
      balance: 200,
    })
  })
})

