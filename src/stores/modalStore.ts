import { create } from 'zustand'

type ModalType = 'default' | 'password'

interface ModalData {
	type: ModalType
	title: string
	onAction: (password?: string) => void // password를 인자로 받을 수 있게 수정
}

interface ModalStore {
	isOpen: boolean
	modalData: ModalData | null
	openModal: (data: ModalData) => void
	closeModal: () => void
}

const useModalStore = create<ModalStore>((set) => ({
	isOpen: false,
	modalData: null,
	openModal: (data: ModalData) => set({ isOpen: true, modalData: data }),
	closeModal: () => set({ isOpen: false, modalData: null }),
}))

export default useModalStore
