export function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || 'dev'

  return (
    <footer className="mt-auto border-t bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>© 2025 Tasker</div>
          <div className="font-mono">version: {version}</div>
        </div>
      </div>
    </footer>
  )
}
