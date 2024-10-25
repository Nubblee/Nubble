import styled from '@emotion/styled'
import colors from '@/constants/color'
import { fontSize, fontWeight } from '@/constants/font'
import useModalStore from '@/stores/modalStore'

const Modal = () => {
	const { isOpen, modalData, closeModal } = useModalStore()

	if (!isOpen || !modalData) return null

	const { type, title, onAction } = modalData

	return (
		<ModalBackground>
			<ModalContainer>
				<div className="title">{title}</div>
				<div className="content">
					<div className="content-desc">삭제할거야? 진짜할거야?</div>
					{type === 'password' && <input type="password" placeholder="비밀번호" />}
				</div>
				<div className="btn-container">
					<button className="cancel-btn" onClick={closeModal}>
						취소
					</button>
					<button
						className="confirm-btn"
						onClick={() => {
							onAction()
							closeModal()
						}}
					>
						확인
					</button>
				</div>
			</ModalContainer>
		</ModalBackground>
	)
}

const ModalBackground = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background: rgba(0, 0, 0, 0.6);
`
const ModalContainer = styled.div`
	position: absolute;
	width: 380px;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: #1e1e1e;
	border-radius: 5px;
	padding: 30px 30px;

	.title {
		font-size: ${fontSize.xl};
		margin-bottom: 30px;
	}

	.content {
		text-align: center;
		margin-bottom: 12px;
	}

	.content-desc {
		margin-bottom: 20px;
	}

	input {
		width: 102px;
		background-color: ${colors.mainGray};
		padding: 6px 10px;
		border-radius: 5px;
		font-size: ${fontSize.sm};
		text-align: center;
	}

	.btn-container {
		text-align: right;

		.cancel-btn {
			color: ${colors.primaryBlue};
			background-color: transparent;
			margin: 0;

			&:hover {
				font-weight: ${fontWeight.semiBold};
			}
		}

		.confirm-btn {
			background-color: ${colors.primaryBlue};
			padding: 6px 14px;
			border-radius: 10px;
			color: #1e1e1e;
			margin: 0;

			&:hover {
				background-color: ${colors.hoverBlue};
			}
		}
	}
`

export default Modal
