'use client'

import { useState } from 'react'

import { CmsImage } from '@/components/CmsImage/CmsImage'
import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import columns from '@/components/ContentColumns/ContentColumns.module.css'
import type { About, AboutPersonSubBlock, AboutTextSubBlock } from '@/payload-types'

import styles from './AboutSections.module.css'

type AboutGroup = NonNullable<About['groups']>[number]
type AboutBlock = NonNullable<AboutGroup['blocks']>[number]
type AboutSubBlock = NonNullable<AboutBlock['subBlocks']>[number]

type NavItem = {
  key: string
  title: string
  content: AboutBlock['content']
  subBlocks: AboutSubBlock[]
}

type AboutSectionsProps = {
  groups: NonNullable<About['groups']>
}

function blockKey(groupIndex: number, blockIndex: number, block: AboutBlock) {
  return block.id || `${groupIndex}-${blockIndex}`
}

function firstBlockKey(groups: NonNullable<About['groups']>) {
  for (const [groupIndex, group] of groups.entries()) {
    const block = group.blocks?.[0]
    if (block) {
      return blockKey(groupIndex, 0, block)
    }
  }
  return null
}

export function AboutSections({ groups }: AboutSectionsProps) {
  const [activeKey, setActiveKey] = useState(() => firstBlockKey(groups))

  const items: NavItem[] = groups.flatMap((group, groupIndex) =>
    (group.blocks ?? []).map((block, blockIndex) => ({
      key: blockKey(groupIndex, blockIndex, block),
      title: block.title,
      content: block.content,
      subBlocks: block.subBlocks ?? [],
    })),
  )

  const active = items.find((item) => item.key === activeKey) ?? items[0]

  if (!active) {
    return null
  }

  return (
    <div className={columns.columns}>
      <nav aria-label="About sections" className={styles.nav}>
        {groups.map((group, groupIndex) => {
          const blocks = group.blocks ?? []
          if (!blocks.length) {
            return null
          }

          const numbered = Boolean(group.heading)

          return (
            <div className={styles.group} key={group.id || groupIndex}>
              {group.heading ? <p className={styles.heading}>{group.heading}</p> : null}
              <ul className={numbered ? styles.numberedList : styles.list}>
                {blocks.map((block, blockIndex) => {
                  const key = blockKey(groupIndex, blockIndex, block)
                  const isActive = key === active.key

                  return (
                    <li key={key}>
                      <button
                        type="button"
                        className={`${styles.link}${isActive ? ` ${styles.active}` : ''}`}
                        aria-current={isActive ? 'true' : undefined}
                        onClick={() => setActiveKey(key)}
                      >
                        {numbered ? (
                          <span className={styles.index}>{blockIndex + 1}.</span>
                        ) : null}
                        <span>{block.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      <div className={styles.panel}>
        <CmsRichText data={active.content} className={columns.richText} />
        {active.subBlocks.length ? (
          <div className={styles.subBlocks}>
            {active.subBlocks.map((subBlock) => {
              switch (subBlock.blockType) {
                case 'text':
                  return <TextSubBlock block={subBlock} key={subBlock.id} />
                case 'person':
                  return <PersonSubBlock block={subBlock} key={subBlock.id} />
                default:
                  return null
              }
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function TextSubBlock({ block }: { block: AboutTextSubBlock }) {
  return <CmsRichText data={block.content} className={columns.richText} />
}

function PersonSubBlock({ block }: { block: AboutPersonSubBlock }) {
  const layout = block.layout || 'inline'

  return (
    <article className={`${styles.person} ${styles[layout]}`}>
      {block.image ? (
        <div className={styles.personMedia}>
          <CmsImage
            className={styles.personImage}
            fallbackAlt={block.name}
            sizes="185px"
            value={block.image}
          />
        </div>
      ) : null}
      <div className={styles.personCopy}>
        <h3 className={styles.personName}>{block.name}</h3>
        {block.title ? <p className={styles.personTitle}>{block.title}</p> : null}
        <CmsRichText data={block.bio} className={styles.personBio} />
      </div>
    </article>
  )
}
