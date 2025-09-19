// Desc: Layout for auth pages
// all route pages that live within the auth folder will use this layout file

function AuthLayout({ children }) {
  return (
    <div className="flex items-center justify-center h-full">
      {children}
    </div>
  )
}

export default AuthLayout