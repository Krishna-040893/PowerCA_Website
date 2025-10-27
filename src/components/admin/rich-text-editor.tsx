'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { useEffect, useState } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none h-[350px] overflow-y-auto p-4 border-t prose-headings:font-extrabold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:leading-tight prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:leading-snug prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-bold prose-ul:my-6 prose-li:my-2',
        style: '--tw-prose-headings: inherit; --tw-prose-body: inherit;',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const applyColor = (color: string) => {
    editor.chain().focus().setColor(color).run()
    setSelectedColor(color)
    setShowColorPicker(false)
  }

  const predefinedColors = [
    '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4',
  ]

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1 items-center">
        {/* Heading Buttons */}
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1 (24px)"
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2 (20px)"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3 (18px)"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px bg-gray-300 mx-1 h-6" />

        {/* Text Formatting */}
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('underline') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px bg-gray-300 mx-1 h-6" />

        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px bg-gray-300 mx-1 h-6" />

        {/* Link */}
        <Button
          type="button"
          variant={editor.isActive('link') ? 'default' : 'outline'}
          size="sm"
          onClick={addLink}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="w-px bg-gray-300 mx-1 h-6" />

        {/* Color Picker */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </Button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-white border rounded-lg shadow-lg z-50 w-64">
              <div className="mb-2 text-xs font-medium text-gray-700">Select Color:</div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyColor(color)}
                    className="w-10 h-10 rounded border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? '#3B82F6' : '#D1D5DB'
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Custom:</label>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-12 h-8 rounded border cursor-pointer"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => applyColor(selectedColor)}
                  className="text-xs"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px bg-gray-300 mx-1 h-6" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor - with custom styles matching single blog post page */}
      <style jsx global>{`
        .ProseMirror h1 {
          font-size: 24px !important;
          font-weight: 800 !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.75rem !important;
          line-height: 1.2 !important;
          color: #111827 !important;
        }
        .ProseMirror h2 {
          font-size: 30px !important;
          font-weight: 800 !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.75rem !important;
          line-height: 1.2 !important;
          color: #111827 !important;
        }
        .ProseMirror h3 {
          font-size: 24px !important;
          font-weight: 800 !important;
          margin-top: 1.25rem !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.3 !important;
          color: #111827 !important;
        }
        .ProseMirror p {
          margin-bottom: 0.75rem !important;
          color: #374151 !important;
          line-height: 1.6 !important;
        }
        .ProseMirror a {
          color: #2563eb !important;
          text-decoration: none !important;
        }
        .ProseMirror a:hover {
          text-decoration: underline !important;
        }
        .ProseMirror strong {
          color: #111827 !important;
          font-weight: 700 !important;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
          padding-left: 2rem !important;
          list-style-position: outside !important;
        }
        .ProseMirror ul {
          list-style-type: disc !important;
        }
        .ProseMirror ol {
          list-style-type: decimal !important;
        }
        .ProseMirror li {
          margin-top: 0.25rem !important;
          margin-bottom: 0.25rem !important;
          padding-left: 0.5rem !important;
          color: #374151 !important;
          line-height: 1.6 !important;
        }
        .ProseMirror li p {
          margin: 0 !important;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  )
}
