import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styling/Finish.css';
import { auth, db } from '../Components/FirebaseConfig';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';

const Finish = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { asteroidsDestroyed, difficulty } = location.state || { asteroidsDestroyed: 0, difficulty: 'EASY' };
    const [highestScore, setHighestScore] = useState(null); // Initial state as null to track loading properly
    const [loadingScore, setLoadingScore] = useState(true);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    useEffect(() => {
        const fetchAndUpdateHighestScore = async () => {
            setLoadingScore(true);
            const user = auth.currentUser;

            if (!user) {
                setLoadingScore(false);
                return;
            }

            try {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
                let updatedHighestScore = parseInt(localStorage.getItem("highestScore")) || 0;

                if (userDoc.exists()) {
                    const firestoreHighScore = userDoc.data().highestScore || 0;

                    // Check if a new high score is achieved
                    if (difficulty === 'HARD' && asteroidsDestroyed > firestoreHighScore) {
                        updatedHighestScore = asteroidsDestroyed; // Set to new high score
                        await updateDoc(userRef, { highestScore: asteroidsDestroyed });
                    } else {
                        updatedHighestScore = firestoreHighScore;
                    }

                    // Set the highest score state and local storage after the update
                    setHighestScore(updatedHighestScore);
                    localStorage.setItem("highestScore", updatedHighestScore);
                } else {
                    // First-time user setup in Firestore and localStorage
                    await setDoc(userRef, { highestScore: asteroidsDestroyed });
                    setHighestScore(asteroidsDestroyed);
                    localStorage.setItem("highestScore", asteroidsDestroyed);
                }
            } catch (error) {
                console.error("Error fetching or updating highest score:", error);
            } finally {
                setLoadingScore(false);
            }
        };

        // Adding a slight delay to ensure Firebase updates propagate
        setTimeout(fetchAndUpdateHighestScore, 300);
    }, [asteroidsDestroyed, difficulty]);

    const handlePlayAgain = async () => {
        const user = auth.currentUser;

        if (user) {
            try {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    navigate('/lobby');
                } else {
                    console.error("User document not found in Firestore.");
                    navigate('/login');
                }
            } catch (error) {
                console.error("Error verifying user document:", error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    };

    const toggleLeaderboardModal = () => {
        setShowLeaderboard(!showLeaderboard);
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoadingLeaderboard(true);
            try {
                const leaderboardRef = collection(db, "users");
                const leaderboardQuery = query(leaderboardRef, orderBy("highestScore", "desc"));
                const leaderboardSnapshot = await getDocs(leaderboardQuery);

                const leaderboard = leaderboardSnapshot.docs.map(doc => ({
                    username: doc.data().username,
                    score: doc.data().highestScore || 0
                }));

                setLeaderboardData(leaderboard);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        if (showLeaderboard) {
            fetchLeaderboard();
        }
    }, [showLeaderboard]);

    return (
        <div className="finish-container">
            <h1>Game Over</h1>
            <p>Asteroids Destroyed: {asteroidsDestroyed}</p>
            <p>
                Highest Score: {loadingScore ? (
                    <span className="loading-indicator">Loading...</span>
                ) : (
                    ` ${highestScore}`
                )}
            </p>

            <button className="leaderboard-button" onClick={toggleLeaderboardModal}>
                LEADERBOARD
            </button>

            <button className="play-again-button" onClick={handlePlayAgain}>
                Play Again
            </button>

            {showLeaderboard && (
                <div className="leaderboard-modal-overlay" onClick={toggleLeaderboardModal}>
                    <div className="leaderboard-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>LEADERBOARD</h3>
                        <div className="leaderboard-content">
                            <div className="leaderboard-header">
                                <span>Username</span>
                                <span>Score</span>
                            </div>
                            {loadingLeaderboard ? (
                                <div className="leaderboard-row">
                                    <span>Loading...</span>
                                </div>
                            ) : leaderboardData.length > 0 ? (
                                leaderboardData.map((player, index) => (
                                    <div key={index} className="leaderboard-row">
                                        <span>{player.username}</span>
                                        <span>{player.score}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="leaderboard-row">
                                    <span>N/A</span>
                                    <span>N/A</span>
                                </div>
                            )}
                        </div>
                        <button className="close-button" onClick={toggleLeaderboardModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finish;
