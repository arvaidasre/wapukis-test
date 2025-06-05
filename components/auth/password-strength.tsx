"use client"

import { Progress } from "@/components/ui/progress"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = [
    { label: "Mažiausiai 8 simboliai", test: (pwd: string) => pwd.length >= 8 },
    { label: "Didžioji raidė", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: "Mažoji raidė", test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: "Skaičius", test: (pwd: string) => /\d/.test(pwd) },
    { label: "Specialus simbolis", test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ]

  const passedRequirements = requirements.filter((req) => req.test(password)).length
  const strength = (passedRequirements / requirements.length) * 100

  const getStrengthColor = () => {
    if (strength < 40) return "bg-red-500"
    if (strength < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (strength < 40) return "Silpnas"
    if (strength < 70) return "Vidutinis"
    return "Stiprus"
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-green-900 dark:text-green-100">
          <span>Slaptažodžio stiprumas:</span>
          <span
            className={`font-medium ${
              strength < 40 ? "text-red-600" : strength < 70 ? "text-yellow-600" : "text-green-600"
            }`}
          >
            {getStrengthText()}
          </span>
        </div>
        <Progress value={strength} className="h-2 bg-gray-200 dark:bg-gray-700">
          <div className={`h-full transition-all ${getStrengthColor()}`} style={{ width: `${strength}%` }} />
        </Progress>
      </div>

      <div className="space-y-1">
        {requirements.map((req, index) => {
          const passed = req.test(password)
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {passed ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-400" />}
              <span className={passed ? "text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-400"}>
                {req.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
