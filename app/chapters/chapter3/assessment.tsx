import { useRouter } from "expo-router";
import { useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CelebrationModal } from "../../../components/CelebrationModal";
import { Colors } from "../../../constants/Colors";
import { useProgress } from "../../../contexts/ProgressContext";
import { useColorScheme } from "../../../hooks/useColorScheme";

const assessmentQuestions = [
	{
		question: "Comment dit-on 'I would like some bread' en français?",
		options: [
			"Je voudrais le pain",
			"Je voudrais du pain",
			"Je voudrais de pain",
			"Je voudrais un pain",
		],
		correct: "Je voudrais du pain",
	},
	{
		question: "Quel est le repas principal de la journée en France?",
		options: ["Le petit-déjeuner", "Le déjeuner", "Le goûter", "Le dîner"],
		correct: "Le déjeuner",
	},
	{
		question: "Que signifie 'l'addition' dans un restaurant?",
		options: ["The menu", "The bill", "The waiter", "The food"],
		correct: "The bill",
	},
	{
		question: "Comment dit-on 'vegetables' en français?",
		options: ["Les fruits", "Les légumes", "La viande", "Le poisson"],
		correct: "Les légumes",
	},
	{
		question: "Quelle boisson accompagne traditionnellement le fromage?",
		options: ["Le café", "Le thé", "Le vin", "Le jus"],
		correct: "Le vin",
	},
	{
		question: "Comment commande-t-on poliment dans un restaurant français?",
		options: ["Donnez-moi", "Je veux", "Je voudrais", "Apportez-moi"],
		correct: "Je voudrais",
	},
];

export default function AssessmentScreen() {
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme ?? "light"];
	const router = useRouter();
	const { updateLessonProgress, addXP, unlockChapter } = useProgress();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [answers, setAnswers] = useState<string[]>([]);
	const [showCelebration, setShowCelebration] = useState(false);
	const [finalScore, setFinalScore] = useState(0);
	const [xpEarned, setXpEarned] = useState(0);

	const currentQuestion = assessmentQuestions[currentQuestionIndex];
	const progress =
		((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;

	const handleAnswerSelect = (answer: string) => {
		setSelectedAnswer(answer);
	};

	const handleNext = () => {
		if (!selectedAnswer) return;

		// Store the answer
		const newAnswers = [...answers, selectedAnswer];
		setAnswers(newAnswers);

		if (currentQuestionIndex < assessmentQuestions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
			setSelectedAnswer(null);
		} else {
			handleAssessmentComplete(newAnswers);
		}
	};
	const handleAssessmentComplete = async (finalAnswers: string[]) => {
		// Calculate score
		let correctCount = 0;
		assessmentQuestions.forEach((question, index) => {
			if (finalAnswers[index] === question.correct) {
				correctCount++;
			}
		});

		const score = Math.round((correctCount / assessmentQuestions.length) * 100);
		const isPerfect = score === 100;
		const passed = score >= 70;

		// Calculate XP based on performance
		const xpAmount = isPerfect ? 60 : passed ? 50 : 30;

		// Set state for celebration modal
		setFinalScore(score);
		setXpEarned(xpAmount);

		// Update lesson progress
		await updateLessonProgress({
			lessonId: "assessment",
			chapterId: "chapter3",
			completed: passed,
			score: score,
			timeSpent: 0,
			attempts: 1,
		});
		// Add XP
		await addXP(xpAmount);

		// Unlock next chapter if assessment passed
		if (passed) {
			await unlockChapter("chapter4");
		}

		// Show celebration
		setShowCelebration(true);
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<ScrollView style={styles.scrollView}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						style={[styles.backButton, { backgroundColor: colors.card }]}
						onPress={() => router.back()}
					>
						<Text style={[styles.backButtonText, { color: colors.text }]}>
							← Retour
						</Text>
					</TouchableOpacity>

					<View style={styles.headerInfo}>
						<Text style={[styles.title, { color: colors.text }]}>
							Évaluation Chapitre 3
						</Text>
						<Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
							La Nourriture et Les Repas
						</Text>
					</View>
				</View>

				{/* Progress Bar */}
				<View
					style={[styles.progressContainer, { backgroundColor: colors.border }]}
				>
					<View
						style={[
							styles.progressBar,
							{ width: `${progress}%`, backgroundColor: colors.primary },
						]}
					/>
				</View>

				{/* Question Card */}
				<View
					style={[
						styles.questionCard,
						{ backgroundColor: colors.card, borderColor: colors.border },
					]}
				>
					<Text
						style={[styles.questionNumber, { color: colors.tabIconDefault }]}
					>
						Question {currentQuestionIndex + 1} sur {assessmentQuestions.length}
					</Text>

					<Text style={[styles.questionText, { color: colors.text }]}>
						{currentQuestion.question}
					</Text>

					<View style={styles.optionsContainer}>
						{currentQuestion.options.map((option, index) => (
							<TouchableOpacity
								key={index}
								style={[
									styles.optionButton,
									{
										backgroundColor:
											selectedAnswer === option
												? colors.primary
												: colors.background,
										borderColor:
											selectedAnswer === option
												? colors.primary
												: colors.border,
									},
								]}
								onPress={() => handleAnswerSelect(option)}
							>
								<Text
									style={[
										styles.optionText,
										{
											color: selectedAnswer === option ? "white" : colors.text,
										},
									]}
								>
									{option}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Continue Button */}
				<TouchableOpacity
					style={[
						styles.continueButton,
						{
							backgroundColor: selectedAnswer ? colors.primary : colors.border,
							opacity: selectedAnswer ? 1 : 0.5,
						},
					]}
					onPress={handleNext}
					disabled={!selectedAnswer}
				>
					<Text style={styles.continueButtonText}>
						{currentQuestionIndex === assessmentQuestions.length - 1
							? "Terminer l'évaluation"
							: "Question suivante"}
					</Text>
				</TouchableOpacity>

				{/* Progress Info */}
				<View style={styles.progressInfo}>
					<Text style={[styles.progressText, { color: colors.tabIconDefault }]}>
						Progression: {currentQuestionIndex + 1} /{" "}
						{assessmentQuestions.length} questions
					</Text>
				</View>
			</ScrollView>

			{/* Celebration Modal */}
			<CelebrationModal
				visible={showCelebration}
				onClose={() => {
					setShowCelebration(false);
					router.back();
				}}
				title="Évaluation Terminée! 📝"
				message={`Score Final: ${finalScore}%`}
				type={finalScore === 100 ? "perfect_score" : "lesson_complete"}
				xpEarned={xpEarned}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
		padding: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	backButton: {
		padding: 10,
		borderRadius: 8,
		marginRight: 15,
	},
	backButtonText: {
		fontSize: 16,
	},
	headerInfo: {
		flex: 1,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 16,
	},
	progressContainer: {
		height: 8,
		borderRadius: 4,
		marginBottom: 30,
	},
	progressBar: {
		height: "100%",
		borderRadius: 4,
	},
	questionCard: {
		borderRadius: 16,
		borderWidth: 1,
		padding: 20,
		marginBottom: 20,
	},
	questionNumber: {
		fontSize: 14,
		marginBottom: 10,
		textAlign: "center",
	},
	questionText: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 20,
		textAlign: "center",
		lineHeight: 26,
	},
	optionsContainer: {
		marginTop: 10,
	},
	optionButton: {
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
		borderWidth: 2,
	},
	optionText: {
		fontSize: 16,
		textAlign: "center",
		fontWeight: "500",
	},
	continueButton: {
		paddingVertical: 15,
		borderRadius: 10,
		alignItems: "center",
		marginBottom: 20,
	},
	continueButtonText: {
		fontSize: 18,
		fontWeight: "600",
		color: "white",
	},
	progressInfo: {
		alignItems: "center",
	},
	progressText: {
		fontSize: 16,
	},
});
