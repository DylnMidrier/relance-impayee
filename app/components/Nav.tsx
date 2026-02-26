import AuthButton from './AuthButton'

export default function Nav() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
      <a href="#" className="flex items-center gap-2 no-underline group">
        <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-black tracking-tighter">RI</span>
        </span>
        <span className="text-xl font-black tracking-tight text-gray-900">
          Recouvr<span className="text-indigo-600">.io</span>
        </span>
      </a>
      <AuthButton />
    </nav>
  )
}
