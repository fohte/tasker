export default function Footer() {
  const version = process.env.NEXT_PUBLIC_VERSION_ID || 'development'
  const environment = process.env.NODE_ENV || 'development'

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50 py-4">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600">
        <p>
          Environment: <span className="font-mono">{environment}</span> |
          Version: <span className="font-mono">{version.substring(0, 8)}</span>
        </p>
      </div>
    </footer>
  )
}
