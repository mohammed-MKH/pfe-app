"use client"

import { useState, useEffect } from "react"
import {
  getProductsByUser,
  getProductsByAdmin,
  setProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/firestore"
import type { Product, ProductStatus } from "@/types"
import { useAuth } from "@/hooks/useAuth"

export function useProducts() {
  const { appUser }                         = useAuth()
  const [products, setProducts]             = useState<Product[]>([])
  const [loading,  setLoading]              = useState(true)

  useEffect(() => {
    if (!appUser) return
    async function load() {
      try {
        let data: Product[]
        if (appUser!.role === "worker") {
          data = await getProductsByUser(appUser!.uid)
        } else {
          data = await getProductsByAdmin(appUser!.adminId)
        }
        setProducts(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [appUser])

  async function submit(params: {
    name:      string
    quantity:  number
    unite:     string
    condition: string
    location:  string
    lotNumber: string
    notes:     string
    photoURLs: string[]
  }): Promise<string> {
    if (!appUser) throw new Error("Not logged in")
    const productId = `prod_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const product: Product = {
      productId,
      adminId:         appUser.adminId,
      submittedBy:     appUser.uid,
      submittedByName: appUser.displayName,
      name:            params.name,
      quantity:        params.quantity,
      unite:           params.unite,
      condition:       params.condition,
      location:        params.location,
      lotNumber:       params.lotNumber,
      notes:           params.notes,
      photoURLs:       params.photoURLs,
      status:          "pending",
      reviewedBy:      null,
      managerComment:  null,
      createdAt:       Date.now(),
      updatedAt:       Date.now(),
    }
    await setProduct(product)
    setProducts(prev => [product, ...prev])
    return productId
  }

  async function review(params: {
    productId:      string
    status:         ProductStatus
    managerComment: string
    reviewedBy:     string
  }) {
    await updateProduct(params.productId, {
      status:         params.status,
      managerComment: params.managerComment,
      reviewedBy:     params.reviewedBy,
    })
    setProducts(prev =>
      prev.map(p =>
        p.productId === params.productId
          ? { ...p, ...params, updatedAt: Date.now() }
          : p
      )
    )
  }

  async function remove(productId: string) {
    await deleteProduct(productId)
    setProducts(prev => prev.filter(p => p.productId !== productId))
  }

  async function edit(productId: string, data: Partial<Product>) {
    await updateProduct(productId, data)
    setProducts(prev =>
      prev.map(p =>
        p.productId === productId
          ? { ...p, ...data, updatedAt: Date.now() }
          : p
      )
    )
  }

  return { products, loading, submit, review, remove, edit }
}