"use client"

import { useState, useEffect, useCallback, useRef } from "react"

type StorageValue<T> = T | null

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [StorageValue<T>, (value: T | ((val: StorageValue<T>) => T)) => void, () => void] {
  // Check if localStorage is available (not in SSR or when cookies are disabled)
  const isLocalStorageAvailable = typeof window !== "undefined" && window.localStorage !== undefined

  // Use a ref to track if we've already tried to read from localStorage
  const hasReadFromStorage = useRef(false)

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<StorageValue<T>>(() => {
    if (!isLocalStorageAvailable) {
      return initialValue
    }

    // Only try to read from localStorage once
    if (hasReadFromStorage.current) return initialValue
    hasReadFromStorage.current = true

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Previous value ref to avoid unnecessary writes
  const previousValueRef = useRef<string | null>(null)

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: StorageValue<T>) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value

        // Save state
        setStoredValue(valueToStore)

        // Save to local storage, but only if the value has changed
        if (isLocalStorageAvailable) {
          const valueAsString = JSON.stringify(valueToStore)

          // Only write to localStorage if the value has changed
          if (previousValueRef.current !== valueAsString) {
            previousValueRef.current = valueAsString

            try {
              window.localStorage.setItem(key, valueAsString)
            } catch (storageError) {
              // Handle quota exceeded error specifically
              if (
                storageError instanceof DOMException &&
                (storageError.code === 22 || // Chrome
                  storageError.code === 1014 || // Firefox
                  storageError.name === "QuotaExceededError" ||
                  storageError.name === "NS_ERROR_DOM_QUOTA_REACHED")
              ) {
                console.warn(`localStorage quota exceeded for key "${key}". Falling back to memory-only storage.`)
              } else {
                throw storageError
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [isLocalStorageAvailable, key, storedValue],
  )

  // Remove item from localStorage
  const removeItem = useCallback(() => {
    try {
      // Remove from state
      setStoredValue(null)

      // Remove from localStorage
      if (isLocalStorageAvailable) {
        window.localStorage.removeItem(key)
        previousValueRef.current = null
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [isLocalStorageAvailable, key])

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    if (!isLocalStorageAvailable) return

    // This function will be called when the localStorage changes in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return

      try {
        // If the key was removed
        if (e.newValue === null) {
          setStoredValue(null)
          previousValueRef.current = null
          return
        }

        // Otherwise set the new value
        const newValue = JSON.parse(e.newValue)
        setStoredValue(newValue)
        previousValueRef.current = e.newValue
      } catch (error) {
        console.error(`Error handling storage change for key "${key}":`, error)
      }
    }

    // Add event listener
    window.addEventListener("storage", handleStorageChange)

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [isLocalStorageAvailable, key])

  return [storedValue, setValue, removeItem]
}

