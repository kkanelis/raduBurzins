import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AlbumPhotoViewer from './AlbumPhotoViewer'

afterEach(cleanup)

function createViewerProps(overrides = {}) {
  const photo = {
    id: 12,
    title: 'Ģimenes svētki',
    note: 'Vasaras tikšanās',
    image_path: '/storage/family.jpg',
    reactions: { '8': '❤️' },
  }

  return {
    album: { title: 'Vasara', photos: [photo] },
    photo,
    photoIndex: 0,
    usersById: new Map([['8', { first_name: 'Anna', last_name: 'Liepa' }]]),
    isAlbumCreator: false,
    reactionLoading: false,
    deletingPhoto: false,
    onClose: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onReact: vi.fn(),
    onRemoveReaction: vi.fn(),
    onEditPhoto: vi.fn(),
    onDeletePhoto: vi.fn(),
    ...overrides,
  }
}

describe('AlbumPhotoViewer', () => {
  it('shows the selected photo and invokes navigation and reaction callbacks', () => {
    const props = createViewerProps()
    render(<AlbumPhotoViewer {...props} />)

    expect(screen.getByRole('dialog', { name: 'Ģimenes svētki' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Ģimenes svētki' }).getAttribute('src')).toBe('/storage/family.jpg')
    expect(screen.getByText('Anna Liepa')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Iepriekšējais foto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Nākamais foto' }))
    fireEvent.click(screen.getByRole('button', { name: /Patīk/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Noņemt reakciju' }))

    expect(props.onPrevious).toHaveBeenCalledOnce()
    expect(props.onNext).toHaveBeenCalledOnce()
    expect(props.onReact).toHaveBeenCalledWith('❤️')
    expect(props.onRemoveReaction).toHaveBeenCalledOnce()
  })

  it('shows photo editing and deletion controls only to the album creator', () => {
    const props = createViewerProps({ isAlbumCreator: true })
    render(<AlbumPhotoViewer {...props} />)

    fireEvent.click(screen.getByRole('button', { name: 'Labot foto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dzēst foto' }))

    expect(props.onEditPhoto).toHaveBeenCalledOnce()
    expect(props.onDeletePhoto).toHaveBeenCalledOnce()

    cleanup()
    render(<AlbumPhotoViewer {...createViewerProps()} />)

    expect(screen.queryByRole('button', { name: 'Labot foto' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Dzēst foto' })).toBeNull()
  })
})