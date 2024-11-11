import styled from '@emotion/styled'
import colors from '@/constants/color'
import { fontSize, fontWeight } from '@/constants/font'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ContentItem {
	id: number
	title: string
	username: string
	likeCount: number
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
					{content.map(({ id, title, username, likeCount }, i) => (
						<Link to={`/postDetail/스터디/@${username}/${encodeURIComponent(title)}/${id}`}>
							<li key={id} className="list-container">
								<div className="title-text">
									{i + 1}. <span>{title}</span>
								</div>
								<div className="list-info">
									<div className="user-name">{username}</div>
									<Heart color={colors.primaryBlue} fill={colors.primaryBlue} size={16} />
									<span>{likeCount}</span>
								</div>
							</li>
						</Link>
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

	.title-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 120px; /* 원하는 너비에 맞게 설정 */
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
