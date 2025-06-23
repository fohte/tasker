export function Footer() {
  const version =
    process.env.NEXT_PUBLIC_VERSION_ID ||
    process.env.NEXT_PUBLIC_APP_VERSION ||
    'development'
  const environment = process.env.NODE_ENV || 'development'

  return (
    <footer className="mt-auto border-t bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>© 2025 Tasker</div>
          <div>
            Environment: <span className="font-mono">{environment}</span> |
            Version:{' '}
            <span className="font-mono">{version.substring(0, 8)}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
