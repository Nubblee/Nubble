import styled from '@emotion/styled'
import { fontSize, fontWeight } from '@/constants/font'
import { Trash2 } from 'lucide-react'
import colors from '@/constants/color'

const savesContent = [
	{
		id: 1,
		date: '2024년 9월 12일',
		title: '날짜 형식 변환',
		content:
			'안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 ',
	},
	{
		id: 2,
		date: '2024년 9월 12일',
		title: '하츄핑',
		content:
			'오 대박 로봇 대박 어떡해 대박 이러한 기술들은 로봇을 포함한 다양한 NVIDIA 하드웨어 기반 컴퓨터에 응용할 수 있습니다.',
	},
	{
		id: 3,
		date: '2024년 9월 12일',
		title: '날짜 형식 변환',
		content:
			'안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 안녕하세요 ',
	},
	{
		id: 4,
		date: '2024년 9월 12일',
		title: '하츄핑',
		content:
			'오 대박 로봇 대박 어떡해 대박 이러한 기술들은 로봇을 포함한 다양한 NVIDIA 하드웨어 기반 컴퓨터에 응용할 수 있습니다.',
	},
]

const Saves = () => {
	return (
		<Container>
			<div className="title">임시 글 목록</div>
			<SaveContainer>
				<ul className="save">
					{savesContent.map(({ id, date, title, content }) => (
						<li key={id} className="save-list">
							<div className="save-title">{title}</div>
							<div className="save-content">{content}</div>
							<div className="last-container">
								<span>{date}</span>
								<span className="delete">
									<Trash2 strokeWidth={1} size={20} />
									삭제
								</span>
							</div>
						</li>
					))}
				</ul>
			</SaveContainer>
		</Container>
	)
}

const Container = styled.div`
	width: 100%;
	height: 100%;

	margin: 20px auto;
	max-width: 780px;

	.title {
		font-size: 64px;
		font-weight: ${fontWeight.extraBold};
		margin: 100px 0;
	}
`

const SaveContainer = styled.div`
	width: 100%;

	.save-list {
		border-bottom: 1px solid ${colors.commentBlack};
		margin-bottom: 52px;
	}

	.save-title {
		font-size: ${fontSize.xxxxl};
		font-weight: ${fontWeight.semiBold};
		margin-bottom: 38px;
	}

	.save-content {
		font-size: ${fontSize.lg};
		line-height: 1.2;
		margin-bottom: 18px;
	}

	.last-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		color: ${colors.commentGray};
	}

	.delete {
		display: flex;
		align-items: center;
		cursor: pointer;

		&:hover {
			color: ${colors.white};
		}
	}
`
export default Saves
