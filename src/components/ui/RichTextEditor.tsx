'use client'
// src/components/ui/RichTextEditor.tsx
import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Undo, Redo, Minus, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minLength?: number
  maxLength?: number
}

type Level = 1 | 2 | 3 | 4 | 5 | 6

const BLOCK_OPTIONS = [
  { label: 'Paragraphe', value: 'paragraph' },
  { label: 'Titre H1',   value: 'h1' },
  { label: 'Titre H2',   value: 'h2' },
]

// ── Exemple SEO affiché sous l'éditeur ──
const SEO_EXAMPLE = [
  { tag: 'h2', text: 'Titre principal de démonstration SEO' },
  { tag: 'p',  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mot-clé principal sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
  { tag: 'h2', text: 'Sous-titre optimisé avec mot-clé principal' },
  { tag: 'p',  text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Mot-clé secondaire lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nAfin d\'améliorer la lisibilité, ce paragraphe de démonstration alterne des phrases courtes et longues, met en évidence quelques expressions importantes en gras et répète naturellement les termes mot-clé principal et mot-clé secondaire afin de simuler une densité de mots-clés réaliste. Vestibulum id ligula porta felis euismod semper. Donec ullamcorper nulla non metus auctor fringilla.' },
  { tag: 'h2', text: 'Deuxième section de contenu' },
  { tag: 'p',  text: 'Cras mattis consectetur purus sit amet fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Curabitur blandit tempus porttitor. Donec sed odio dui.' },
  { tag: 'h3', text: 'Sous-section détaillée' },
  { tag: 'p',  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.' },
  { tag: 'h3', text: 'Conseils et informations complémentaires' },
  { tag: 'p',  text: 'Nulla vitae elit libero, a pharetra augue. Donec id elit non mi porta gravida at eget metus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Suspendisse potenti. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.' },
  { tag: 'h3', text: 'Titre conclusion' },
  { tag: 'p',  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Ce contenu est uniquement destiné à illustrer une structure éditoriale SEO avec une hiérarchie logique des titres (h1 → h2 → h3), des paragraphes aérés et une répartition naturelle des mots-clés.' },
]

export function SeoExample() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3 border border-amber-200 rounded-xl overflow-hidden bg-amber-50/40">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-amber-50 transition-colors"
      >
        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-amber-700 flex-1">
          Exemple de rédaction optimisée pour le référencement de votre fiche professionnelle
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-amber-400 flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="px-5 py-4 border-t border-amber-200 bg-white/80 space-y-3 text-sm text-gray-700 leading-relaxed">
          {SEO_EXAMPLE.map((block, i) => {
            if (block.tag === 'h2') return (
              <div key={i}>
                <span className="text-xs font-bold text-amber-600 font-mono">&lt;h2&gt;</span>
                <h2 className="inline font-bold text-gray-900 text-base ml-1">{block.text}</h2>
                <span className="text-xs font-bold text-amber-600 font-mono ml-1">&lt;/h2&gt;</span>
              </div>
            )
            if (block.tag === 'h3') return (
              <div key={i}>
                <span className="text-xs font-bold text-amber-600 font-mono">&lt;h3&gt;</span>
                <h3 className="inline font-semibold text-gray-800 ml-1">{block.text}</h3>
                <span className="text-xs font-bold text-amber-600 font-mono ml-1">&lt;/h3&gt;</span>
              </div>
            )
            return (
              <div key={i} className="text-gray-600 leading-relaxed">
                <span className="text-xs font-bold text-brand-500 font-mono">&lt;p&gt;</span>
                <span className="ml-1">{block.text}</span>
                <span className="text-xs font-bold text-brand-500 font-mono ml-1">&lt;/p&gt;</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function RichTextEditor({
  value, onChange, placeholder,
  minLength = 500, maxLength = 2500,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote:     false,
        code:           false,
        codeBlock:      false,
        horizontalRule: true,
        heading: { levels: [1, 2] as Level[] },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Commencez à écrire…',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[200px] px-4 py-3 text-sm text-gray-800 leading-relaxed',
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return null

  const charCount = editor.getText().length
  const isUnder   = charCount < minLength
  const isOver    = charCount > maxLength
  const pct       = Math.min(100, Math.round((charCount / maxLength) * 100))
  const barColor  = isOver ? 'bg-red-500' : isUnder ? 'bg-amber-400' : 'bg-brand-500'

  const activeBlock = editor.isActive('heading', { level: 1 })
    ? 'h1' : editor.isActive('heading', { level: 2 })
    ? 'h2' : 'paragraph'

  const applyBlock = (val: string) => {
    if (val === 'paragraph') editor.chain().focus().setParagraph().run()
    else if (val === 'h1')   editor.chain().focus().toggleHeading({ level: 1 }).run()
    else if (val === 'h2')   editor.chain().focus().toggleHeading({ level: 2 }).run()
  }

  const Btn = ({
    onClick, active = false, disabled = false, title, children,
  }: {
    onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode
  }) => (
    <button type="button" onClick={onClick} disabled={disabled} title={title}
      className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
        active
          ? 'bg-brand-600 text-white'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed'
      }`}>
      {children}
    </button>
  )

  const Sep = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />

  return (
    <div className={`border rounded-xl overflow-hidden bg-white transition-all focus-within:ring-2 ${
        isOver ? 'border-red-400 focus-within:ring-red-400/20' : 'border-gray-200 focus-within:border-brand-400 focus-within:ring-brand-400/20'
      }`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-surface-50 border-b border-gray-100">
          <div className="relative">
            <select
              value={activeBlock}
              onChange={e => applyBlock(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium text-gray-700 outline-none hover:border-brand-400 cursor-pointer transition-colors"
            >
              {BLOCK_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          <Sep />

          <Btn onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')} title="Gras (Ctrl+B)">
            <Bold className="w-4 h-4" />
          </Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')} title="Italique (Ctrl+I)">
            <Italic className="w-4 h-4" />
          </Btn>

          <Sep />

          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')} title="Liste à puces">
            <List className="w-4 h-4" />
          </Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')} title="Liste numérotée">
            <ListOrdered className="w-4 h-4" />
          </Btn>

          <Sep />

          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur">
            <Minus className="w-4 h-4" />
          </Btn>

          <Sep />

          <Btn onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()} title="Annuler (Ctrl+Z)">
            <Undo className="w-4 h-4" />
          </Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()} title="Rétablir (Ctrl+Y)">
            <Redo className="w-4 h-4" />
          </Btn>
        </div>

        {/* Zone d'édition */}
        <EditorContent editor={editor} />

        {/* Compteur */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 space-y-1.5">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={isUnder ? 'text-amber-600 font-medium' : isOver ? 'text-red-600 font-medium' : 'text-gray-400'}>
              {isUnder && `Minimum ${minLength} caractères recommandés`}
              {isOver  && `Maximum ${maxLength} caractères dépassé`}
              {!isUnder && !isOver && 'Bonne longueur ✓'}
            </span>
            <span className={`font-semibold tabular-nums ${isOver ? 'text-red-600' : isUnder ? 'text-amber-600' : 'text-brand-600'}`}>
              {charCount.toLocaleString('fr-FR')} / {maxLength.toLocaleString('fr-FR')} car.
            </span>
          </div>
        </div>
      </div>
  )
}
