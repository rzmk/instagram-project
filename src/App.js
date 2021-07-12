import React, { useState, useEffect } from "react";
import "./App.css";
import Post from "./Post";
import { auth, db } from "./firebase";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Button, Input } from "@material-ui/core";
import ImageUpload from "./ImageUpload";

function App() {
	function rand() {
		return Math.round(Math.random() * 20) - 10;
	}

	function getModalStyle() {
		const top = 50;
		const left = 50;

		return {
			top: `${top}%`,
			left: `${left}%`,
			transform: `translate(-${top}%, -${left}%)`,
		};
	}

	const useStyles = makeStyles((theme) => ({
		paper: {
			position: "absolute",
			width: 400,
			backgroundColor: theme.palette.background.paper,
			border: "2px solid #000",
			boxShadow: theme.shadows[5],
			padding: theme.spacing(2, 4, 3),
		},
	}));

	const classes = useStyles();
	const [modalStyle, setModalStyle] = useState(getModalStyle);

	const [posts, setPosts] = useState([]);
	const [open, setOpen] = useState(false);
	const [openSignIn, setOpenSignIn] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [user, setUser] = useState(null);

	// useEffect -> Runs a piece of code based on a specific condition

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((authUser) => {
			if (authUser) {
				// user logged in
				console.log(authUser);
				setUser(authUser);

				if (authUser.displayName) {
					// don't update username
				} else {
					// if we just created someone
					return authUser.updateProfile({
						displayName: username,
					});
				}
			} else {
				// user logged out
				setUser(null);
			}
		});

		return () => {
			// perform some cleanup actions
			unsubscribe();
		};
	}, [user, username]);

	useEffect(() => {
		db.collection("posts")
			.orderBy("timestamp", "desc")
			.onSnapshot((snapshot) => {
				// every time post is added it'll take a picture
				setPosts(
					snapshot.docs.map((doc) => ({
						id: doc.id,
						post: doc.data(),
					}))
				);
			});
	}, []);

	const signUp = (event) => {
		event.preventDefault();

		auth.createUserWithEmailAndPassword(email, password)
			.then((authUser) => {
				return authUser.user.updateProfile({
					displayName: username,
				});
			})
			.catch((error) => alert(error.message));

		setOpen(false);
	};

	const signIn = (event) => {
		event.preventDefault();

		auth.signInWithEmailAndPassword(email, password).catch((error) =>
			alert(error.message)
		);

		setOpenSignIn(false);
	};

	return (
		<div className="app">
			{user?.displayName ? (
				<ImageUpload username={user.displayName} />
			) : null}

			{/* Sign Up Modal */}
			<Modal open={open} onClose={() => setOpen(false)}>
				<div style={modalStyle} className={classes.paper}>
					<form className="app__signup">
						<center>
							<img
								src="images/instagram-logo.svg"
								alt=""
								width="50px"
							/>
						</center>
						<h2>Sign Up Here!</h2>
						<Input
							placeholder="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<Input
							placeholder="email"
							type="text"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Input
							placeholder="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button type="submit" onClick={signUp}>
							Sign Up
						</Button>
					</form>
				</div>
			</Modal>

			{/* Sign In Modal */}
			<Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
				<div style={modalStyle} className={classes.paper}>
					<form className="app__signup">
						<center>
							<img
								src="images/instagram-logo.svg"
								alt=""
								width="50px"
							/>
						</center>
						<h2>Sign In Here!</h2>
						<Input
							placeholder="email"
							type="text"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Input
							placeholder="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button type="submit" onClick={signIn}>
							Sign In
						</Button>
					</form>
				</div>
			</Modal>

			{/* Header */}
			<div className="app__header">
				<img
					className="app__headerImage"
					src="/images/instagram-text-logo.png"
					alt=""
					width="100px"
				></img>

				{user ? (
					<Button onClick={() => auth.signOut()}>Logout</Button>
				) : (
					<div className="app__loginContainer">
						<Button onClick={() => setOpenSignIn(true)}>
							Sign In
						</Button>
						<Button onClick={() => setOpen(true)}>Sign Up</Button>
					</div>
				)}
			</div>
			{/* Posts */}

			<div className="app__posts">
				{posts.map(({ id, post }) => (
					<Post
						key={id}
						postId={id}
						user={user}
						username={post.username}
						caption={post.caption}
						imageUrl={post.imageUrl}
					/>
				))}
			</div>
		</div>
	);
}

export default App;
