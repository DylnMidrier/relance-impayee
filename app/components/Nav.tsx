import AuthButton from './AuthButton'
import PlanBadge from './PlanBadge'

export default function Nav() {
  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
      <a href="/" className="flex items-center gap-1.5 no-underline group">
        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-white text-[10px] sm:text-xs font-black tracking-tighter">RI</span>
        </span>
        <span className="text-lg sm:text-xl font-black tracking-tight text-gray-900">
          Recouvr<span className="text-indigo-600">.io</span>
        </span>
      </a>
      <div className="flex items-center gap-2 sm:gap-3">
        <PlanBadge />
        <AuthButton />
      </div>
    </nav>
  )
}
