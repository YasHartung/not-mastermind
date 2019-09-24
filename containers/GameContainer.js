import React from 'react'
import { Text, View, Button } from 'react-native'
import Score from '../components/Score'
import ColorSlots from '../components/ColorSlots'
import ColorPicker from '../components/ColorPicker'
let colors =["#F5EEEA", "#890D96", "#FC8012", "#0B9797", "#ec1037", "#1C47A8"]
let empty =['grey', 'grey', 'grey', 'grey']
let emptyBoard = [[...empty], [...empty], [...empty], [...empty], [...empty], [...empty], [...empty], [...empty]]

export default class GameContainer extends React.Component {

	state={
		currentSlot: 7,
		selectedColor: "#F5EEEA",
		currentBoard: emptyBoard,
		feedbackBoard: emptyBoard,
		winningBoard: null,
		win: false,
		done: false,
		score: 0

	}
	createEmptyBoard = () =>{
		let empty =['grey', 'grey', 'grey', 'grey']
		return  [[...empty], [...empty], [...empty], [...empty], [...empty], [...empty], [...empty], [...empty]]
		 
	}
	updateSelectedColor = (color) => {
		this.setState({
			selectedColor: color
		})
	}

	updateCurrentSlot = () => {
		this.checkGuess();
		if(this.state.currentSlot>0){

			oldSlot = this.state.currentSlot
			this.setState({
				currentSlot: oldSlot - 1
			})
		}else{
			this.setState({
				done: true   
			})
		}
	}

	createMessage=() => {
		if(this.state.win){
			return "You Win! Play Another Game?"
		}
		else{
			return "Sorry, you lost. Try Again?"
		}
	}


	generateWinningColors = () => {
		let randomColors = []
		for(let i=0; i<4; i++){
			randomColors[i] = colors[Math.floor(Math.random() * colors.length)]
		}
		
		return randomColors;
	}

	componentDidMount(){
		fetch("https://3baf2a3d.ngrok.io/total"	)
		.then(r => r.json())
		.then(score =>{
			this.setState({
				score: score
			})
		})
		this.setState({
			currentBoard: this.createEmptyBoard(),
			feedbackBoard: this.createEmptyBoard(),
			winningBoard: this.generateWinningColors()
		})

	}

	componentDidUpdate(prevProps, prevState){
		
		if(prevState.win !== this.state.win){
			console.log("component did update AND passed conditional")
			fetch("https://3baf2a3d.ngrok.io/scores", {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				  },
				body: JSON.stringify({score: 20})
			}).catch(error => console.error('Post request Error', error))

			this.setState({
				score: this.state.score + 20
			})
		}

	}

	checkGuess = () => {
		let guess = [...this.state.currentBoard[this.state.currentSlot]]
		let win = [...this.state.winningBoard]
		console.log("WINNING BOARD", win)
		console.log("current guess", guess)
		let feedback = [...this.state.feedbackBoard[this.state.currentSlot]]
		let j=0;
		for (let i= 0; i<4; i++) {
			
			if(guess[i] === win[i]){
				guess[i] = null;
				win[i]=null;
				feedback[j] = "black";
				j++;
			}
		}
		
		if(!feedback.includes("grey")){
			this.gameover();
		}
		for(let i=0; i<4; i++){
			if(guess[i]){
			
				for(let k = 0; k<4; k++){
					if(i !== k && guess[i]===win[k]){
					
						guess[i] = null;
						win[k]=null;
						feedback[j] = "white";
						j++;
						break;
					}
				}
				
			}
		}
		newFeedback = this.state.feedbackBoard.map((slot, index) => {
			if(index === this.state.currentSlot){
				return feedback
			} else{
				return slot
			}

		})
		this.setState({
			feedbackBoard: newFeedback
		})
	}
	gameover = () => {
		this.setState({
			win: true
		})
	}

	restartGame = () => {
	
		this.setState({
			currentSlot: 7,
			selectedColor: "#F5EEEA",
			currentBoard: this.createEmptyBoard(),
			feedbackBoard: this.createEmptyBoard(),
			winningBoard: this.generateWinningColors(),
			win: false,
			done: false
		})
	}
	updateColorsOnSlot = (index) => {
			let updatedBoard = [...this.state.currentBoard]
			updatedBoard[this.state.currentSlot][index] = this.state.selectedColor
			this.setState({
				currentBoard: updatedBoard
			
		})
	}

	renderColorSlots = () => {
		return [0, 1, 2, 3, 4, 5, 6, 7].map(x => <ColorSlots selectedColor={this.state.selectedColor} updateCurrentSlot={this.updateCurrentSlot} updateColorsOnSlot={this.updateColorsOnSlot} feedbackBoard={this.state.feedbackBoard} currentBoard={this.state.currentBoard} currentSlot={this.state.currentSlot} id={x} key={x}/>)
	}

	render(){
		console.log(this.state.score)
		return(
			<View>
				<Score score={this.state.score} />
				{this.state.done || this.state.win
				?
				<>
				<Button onPress={this.restartGame} title={this.createMessage()} color='#213960'></Button>
				<View style={{flexDirection: 'row', alignItems: 'center',
    	justifyContent: 'center'}}>
					{this.state.winningBoard.map(color=><View key={Math.random()} style={{backgroundColor: color, borderRadius: 100, height: 40, width: 40, margin: 10}}></View>)}
				</View>
				</>
				:
				<>
					{this.renderColorSlots()}
					<ColorPicker updateSelectedColor={this.updateSelectedColor}/>
				</>
				}
			</View>
		)
	}
}