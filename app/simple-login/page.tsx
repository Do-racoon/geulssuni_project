import SimpleLoginForm from "@/components/simple-login-form"

export default function SimpleLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <SimpleLoginForm />

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Having trouble? Try using the "Create Admin User" button to set up an admin account.</p>
        </div>
      </div>
    </div>
  )
}
