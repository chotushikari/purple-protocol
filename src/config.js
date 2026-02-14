// 🛠️ THE MASTER CONFIG
// Edit this file to customize the entire experience!

export const config = {
    // Creator Mode (The "Piyush" Entrance)
    creator: {
        name: "Piyush",
        password: "piyush", // Typing this in Level 1 grants admin access
    },

    // Level 1: Sentient Terminal
    identity: {
        name: "Nandini", // The password & the person
        title: "Coolest Mathematics Girly Pop",
        auraColor: "#b25cff", // Purple
    },
    terminal: {
        messages: [
            "Identifying Subject...",
            "Analyzing Aura...",
            "Result: 100% PURE AWESOMENESS.",
            "Accessing Secret Files...",
        ],
        easterEggs: {
            "3.14": "Pi is infinite, just like my love for you. 🥧",
            "143": "I love you. (Duh!) 💜",
            "bts": "Borahae! 💜💜💜",
        },
    },

    // Level 2: BTS Math Galaxy
    galaxy: {
        musicTrack: "/assets/audio/song.mp3", // Absolute path to public/assets/audio/
        starCount: 5000,
        reasons: [
            "Your smile lights up the universe.",
            "How you solve math problems like a wizard.",
            "Your obsession with purple.",
            "The way you laugh at my bad jokes.",
            "Your kindness is infinite.",
            "You are my favorite variable.",
            "Our chemistry is explosive.",
            "You make my heart beat in Fibonacci.",
            "Every moment with you is a constant.",
            "You are the solution to my equation.",
        ],
    },

    // Level 3: Love Calculator Glitch
    loveCalculator: {
        question: "How much do you love Piyush?",
        minPercentage: 0,
        maxPercentage: 1000, // It goes beyond 100!
    },

    // Level 4: Valentine Proposal
    valentineProposal: {
        question: "Will you be my Valentine?",
        yesButton: "YES! 💖",
        noButton: "No 😢",
        noButtonHoverText: [
            "Are you sure?",
            "Think again!",
            "Last chance!",
            "You're breaking my heart!",
            "Okay, I'll just ask again...",
        ],
    },

    // Level 5: Love Contract
    loveContract: {
        title: "Official Love Contract",
        terms: [
            "I promise to give you unlimited hugs.",
            "I'll share my food (sometimes).",
            "I will always support your dreams.",
            "We will be the cutest couple ever.",
            "This contract is binding forever! 💜",
        ],
        signaturePlaceholder: "Sign here to seal the deal",
        confirmButton: "I ACCEPT 💍",
    },
};
