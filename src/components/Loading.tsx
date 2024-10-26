import styled from '@emotion/styled'
import Lottie from 'lottie-react'
import LoadingAnimation from '@/assets/loading-animation.json'

const Loading = () => {
	console.log('loadingAnimaition')

	return (
		<Container>
			<Lottie
				animationData={LoadingAnimation}
				loop={true}
				autoPlay
				style={{ width: 200, height: 200 }}
			/>
		</Container>
	)
}

const Container = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
`

export default Loading
