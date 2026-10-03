import { useState } from 'react'
import PincodeCheck from './PincodeCheck'

interface Props {
  description: string
  highlights: string[]
}

// ============================================
// LEFT COLUMN ke NICHE — Description/Highlights/Delivery tabs
// ============================================
const ImageSectionTabs = ({ description, highlights }: Props) => {
  const [activeTab, setActiveTab] = useState('Overview')
  const tabs = ['Overview', 'Highlights', 'Delivery Check']

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_color-mix(in_srgb,_var(--ink)_5%,_transparent)] overflow-hidden mt-4">
      <div className="flex border-b border-sand">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ fontFamily: "'Jost', sans-serif" }}
            className={`flex-1 py-3 text-[0.72rem] font-medium tracking-wide transition-colors ${
              activeTab === tab ? 'text-gold border-b-2 border-gold' : 'text-umber'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-5">
        {activeTab === 'Overview' && (
          <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.8rem] text-taupe leading-relaxed">{description}</p>
        )}
        {activeTab === 'Highlights' && (
          <ul className="space-y-2">
            {highlights.map((h) => (
              <li key={h} style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.8rem] text-taupe flex items-start gap-2">
                <span className="text-gold mt-0.5">•</span> {h}
              </li>
            ))}
          </ul>
        )}
        {activeTab === 'Delivery Check' && <PincodeCheck />}
      </div>
    </div>
  )
}

export default ImageSectionTabs