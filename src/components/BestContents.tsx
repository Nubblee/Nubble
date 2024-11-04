import styled from '@emotion/styled'
import colors from '@/constants/color'
import { fontSize, fontWeight } from '@/constants/font'
import { Heart } from 'lucide-react'

interface ContentItem {
	id: number
	title: string
	userName: string
	likes: number
}

interface BestContentsProps {
	title: string
	content: ContentItem[]
}

const BestContents = ({ title, content }: BestContentsProps) => {
	return (
		<Container>
			<div className="title">{title}</div>
			<Ranking>
				<ol>
					{content.map(({ id, title, userName, likes }) => (
						<li key={id} className="list-container">
							<div>
								{id}. <span>{title}</span>
							</div>
							<div className="list-info">
								<div className="user-name">{userName}</div>
								<Heart color={colors.primaryBlue} fill={colors.primaryBlue} size={16} />
								<span>{likes}</span>
							</div>
						</li>
					))}
				</ol>
			</Ranking>
		</Container>
	)
}

const Container = styled.div`
	width: 280px;
	height: 160px;
	background-color: ${colors.mainGray};
	border-radius: 10px;
	box-shadow: 0px 5px 5px -3px rgba(255, 255, 255, 0.5);
	padding: 20px;
	margin-bottom: 40px;

	.title {
		color: ${colors.primaryBlue};
		font-size: ${fontSize.lg};
		font-weight: ${fontWeight.semiBold};
		margin-bottom: 22px;
	}
`
const Ranking = styled.div`
	.list-container {
		display: flex;
		justify-content: space-between;
		font-size: ${fontSize.sm};
		font-weight: ${fontWeight.semiBold};
		margin-bottom: 18px;

		&:hover {
			cursor: pointer;
			text-decoration: underline solid ${colors.white};
		}
	}

	.list-info {
		display: flex;
		span {
			color: ${colors.primaryBlue};
			margin-left: 6px;
		}
	}

	.user-name {
		margin-right: 10px;
	}
`
export default BestContents
