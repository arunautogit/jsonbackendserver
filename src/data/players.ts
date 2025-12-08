export interface Player {
    id: number;
    name: string;
    team: string;
    role: 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';
    image: string;
    isOverseas: boolean;
    stats: {
        runs: number;
        wickets: number;
        catches: number;
        price: number; // in Crores
    };
}

const teams = {
    CSK: 'Chennai Super Kings',
    DC: 'Delhi Capitals',
    GT: 'Gujarat Titans',
    KKR: 'Kolkata Knight Riders',
    LSG: 'Lucknow Super Giants',
    MI: 'Mumbai Indians',
    PBKS: 'Punjab Kings',
    RCB: 'Royal Challengers Bengaluru',
    RR: 'Rajasthan Royals',
    SRH: 'Sunrisers Hyderabad'
};

export const players: Player[] = [
    // CSK
    { id: 1, name: 'Ruturaj Gaikwad', team: teams.CSK, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Ruturaj', stats: { runs: 583, wickets: 0, catches: 8, price: 6.00 } },
    { id: 2, name: 'Shivam Dube', team: teams.CSK, role: 'All-Rounder', isOverseas: false, image: 'https://placehold.co/300x400?text=Dube', stats: { runs: 396, wickets: 1, catches: 4, price: 4.00 } },
    { id: 3, name: 'Ravindra Jadeja', team: teams.CSK, role: 'All-Rounder', isOverseas: false, image: 'https://placehold.co/300x400?text=Jadeja', stats: { runs: 267, wickets: 8, catches: 9, price: 16.00 } },
    { id: 4, name: 'MS Dhoni', team: teams.CSK, role: 'Wicketkeeper', isOverseas: false, image: 'https://placehold.co/300x400?text=Dhoni', stats: { runs: 161, wickets: 0, catches: 10, price: 12.00 } },
    { id: 5, name: 'Daryl Mitchell', team: teams.CSK, role: 'All-Rounder', isOverseas: true, image: 'https://placehold.co/300x400?text=Daryl', stats: { runs: 318, wickets: 1, catches: 6, price: 14.00 } },
    { id: 6, name: 'Matheesha Pathirana', team: teams.CSK, role: 'Bowler', isOverseas: true, image: 'https://placehold.co/300x400?text=Pathirana', stats: { runs: 0, wickets: 13, catches: 2, price: 0.20 } },
    { id: 7, name: 'Mustafizur Rahman', team: teams.CSK, role: 'Bowler', isOverseas: true, image: 'https://placehold.co/300x400?text=Mustafizur', stats: { runs: 0, wickets: 14, catches: 3, price: 2.00 } },
    { id: 8, name: 'Tushar Deshpande', team: teams.CSK, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Tushar', stats: { runs: 0, wickets: 17, catches: 4, price: 0.20 } },

    // RCB
    { id: 9, name: 'Virat Kohli', team: teams.RCB, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Kohli', stats: { runs: 741, wickets: 0, catches: 8, price: 15.00 } },
    { id: 10, name: 'Faf du Plessis', team: teams.RCB, role: 'Batter', isOverseas: true, image: 'https://placehold.co/300x400?text=Faf', stats: { runs: 438, wickets: 0, catches: 10, price: 7.00 } },
    { id: 11, name: 'Rajat Patidar', team: teams.RCB, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Patidar', stats: { runs: 395, wickets: 0, catches: 5, price: 0.20 } },
    { id: 12, name: 'Dinesh Karthik', team: teams.RCB, role: 'Wicketkeeper', isOverseas: false, image: 'https://placehold.co/300x400?text=DK', stats: { runs: 326, wickets: 0, catches: 8, price: 5.50 } },
    { id: 13, name: 'Glenn Maxwell', team: teams.RCB, role: 'All-Rounder', isOverseas: true, image: 'https://placehold.co/300x400?text=Maxwell', stats: { runs: 52, wickets: 6, catches: 4, price: 11.00 } },
    { id: 14, name: 'Cameron Green', team: teams.RCB, role: 'All-Rounder', isOverseas: true, image: 'https://placehold.co/300x400?text=Green', stats: { runs: 255, wickets: 10, catches: 6, price: 17.50 } },
    { id: 15, name: 'Mohammed Siraj', team: teams.RCB, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Siraj', stats: { runs: 0, wickets: 15, catches: 2, price: 7.00 } },
    { id: 16, name: 'Yash Dayal', team: teams.RCB, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Dayal', stats: { runs: 0, wickets: 15, catches: 3, price: 5.00 } },

    // KKR
    { id: 17, name: 'Sunil Narine', team: teams.KKR, role: 'All-Rounder', isOverseas: true, image: 'https://placehold.co/300x400?text=Narine', stats: { runs: 488, wickets: 17, catches: 6, price: 6.00 } },
    { id: 18, name: 'Phil Salt', team: teams.KKR, role: 'Wicketkeeper', isOverseas: true, image: 'https://placehold.co/300x400?text=Salt', stats: { runs: 435, wickets: 0, catches: 9, price: 1.50 } },
    { id: 19, name: 'Shreyas Iyer', team: teams.KKR, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Shreyas', stats: { runs: 351, wickets: 0, catches: 7, price: 12.25 } },
    { id: 20, name: 'Venkatesh Iyer', team: teams.KKR, role: 'All-Rounder', isOverseas: false, image: 'https://placehold.co/300x400?text=Venky', stats: { runs: 370, wickets: 0, catches: 5, price: 8.00 } },
    { id: 21, name: 'Andre Russell', team: teams.KKR, role: 'All-Rounder', isOverseas: true, image: 'https://placehold.co/300x400?text=Russell', stats: { runs: 222, wickets: 19, catches: 4, price: 12.00 } },
    { id: 22, name: 'Rinku Singh', team: teams.KKR, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Rinku', stats: { runs: 168, wickets: 0, catches: 6, price: 0.55 } },
    { id: 23, name: 'Mitchell Starc', team: teams.KKR, role: 'Bowler', isOverseas: true, image: 'https://placehold.co/300x400?text=Starc', stats: { runs: 0, wickets: 17, catches: 2, price: 24.75 } },
    { id: 24, name: 'Varun Chakravarthy', team: teams.KKR, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Varun', stats: { runs: 0, wickets: 21, catches: 3, price: 8.00 } },

    // SRH
    { id: 25, name: 'Travis Head', team: teams.SRH, role: 'Batter', isOverseas: true, image: 'https://placehold.co/300x400?text=Head', stats: { runs: 567, wickets: 0, catches: 5, price: 6.80 } },
    { id: 26, name: 'Abhishek Sharma', team: teams.SRH, role: 'All-Rounder', isOverseas: false, image: 'https://placehold.co/300x400?text=Abhishek', stats: { runs: 484, wickets: 0, catches: 4, price: 6.50 } },
    { id: 27, name: 'Heinrich Klaasen', team: teams.SRH, role: 'Wicketkeeper', isOverseas: true, image: 'https://placehold.co/300x400?text=Klaasen', stats: { runs: 479, wickets: 0, catches: 8, price: 5.25 } },
    { id: 28, name: 'Nitish Kumar Reddy', team: teams.SRH, role: 'All-Rounder', isOverseas: false, image: 'https://placehold.co/300x400?text=Nitish', stats: { runs: 303, wickets: 3, catches: 6, price: 0.20 } },
    { id: 29, name: 'Pat Cummins', team: teams.SRH, role: 'Bowler', isOverseas: true, image: 'https://placehold.co/300x400?text=Cummins', stats: { runs: 136, wickets: 18, catches: 4, price: 20.50 } },
    { id: 30, name: 'Bhuvneshwar Kumar', team: teams.SRH, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Bhuvi', stats: { runs: 0, wickets: 11, catches: 2, price: 4.20 } },
    { id: 31, name: 'T Natarajan', team: teams.SRH, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Natarajan', stats: { runs: 0, wickets: 19, catches: 1, price: 4.00 } },
    { id: 32, name: 'Aiden Markram', team: teams.SRH, role: 'Batter', isOverseas: true, image: 'https://placehold.co/300x400?text=Markram', stats: { runs: 220, wickets: 0, catches: 4, price: 2.60 } },

    // RR
    { id: 33, name: 'Sanju Samson', team: teams.RR, role: 'Wicketkeeper', isOverseas: false, image: 'https://placehold.co/300x400?text=Samson', stats: { runs: 531, wickets: 0, catches: 9, price: 14.00 } },
    { id: 34, name: 'Riyan Parag', team: teams.RR, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Parag', stats: { runs: 573, wickets: 0, catches: 6, price: 3.80 } },
    { id: 35, name: 'Yashasvi Jaiswal', team: teams.RR, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Jaiswal', stats: { runs: 435, wickets: 0, catches: 5, price: 4.00 } },
    { id: 36, name: 'Jos Buttler', team: teams.RR, role: 'Batter', isOverseas: true, image: 'https://placehold.co/300x400?text=Buttler', stats: { runs: 359, wickets: 0, catches: 4, price: 10.00 } },
    { id: 37, name: 'Shimron Hetmyer', team: teams.RR, role: 'Batter', isOverseas: true, image: 'https://placehold.co/300x400?text=Hetmyer', stats: { runs: 113, wickets: 0, catches: 3, price: 8.50 } },
    { id: 38, name: 'Trent Boult', team: teams.RR, role: 'Bowler', isOverseas: true, image: 'https://placehold.co/300x400?text=Boult', stats: { runs: 0, wickets: 13, catches: 2, price: 8.00 } },
    { id: 39, name: 'Yuzvendra Chahal', team: teams.RR, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Chahal', stats: { runs: 0, wickets: 18, catches: 3, price: 6.50 } },
    { id: 40, name: 'Avesh Khan', team: teams.RR, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Avesh', stats: { runs: 0, wickets: 19, catches: 2, price: 10.00 } },

    // MI
    { id: 41, name: 'Rohit Sharma', team: teams.MI, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Rohit', stats: { runs: 417, wickets: 0, catches: 4, price: 16.00 } },
    { id: 42, name: 'Suryakumar Yadav', team: teams.MI, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=SKY', stats: { runs: 345, wickets: 0, catches: 5, price: 8.00 } },
    { id: 43, name: 'Tilak Varma', team: teams.MI, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Tilak', stats: { runs: 416, wickets: 0, catches: 6, price: 1.70 } },
    { id: 44, name: 'Hardik Pandya', team: teams.MI, role: 'All-Rounder', isOverseas: false, image: 'https://placehold.co/300x400?text=Hardik', stats: { runs: 216, wickets: 11, catches: 4, price: 15.00 } },
    { id: 45, name: 'Tim David', team: teams.MI, role: 'Batter', isOverseas: true, image: 'https://placehold.co/300x400?text=Tim', stats: { runs: 241, wickets: 0, catches: 5, price: 8.25 } },
    { id: 46, name: 'Jasprit Bumrah', team: teams.MI, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Bumrah', stats: { runs: 0, wickets: 20, catches: 2, price: 12.00 } },
    { id: 47, name: 'Gerald Coetzee', team: teams.MI, role: 'Bowler', isOverseas: true, image: 'https://placehold.co/300x400?text=Coetzee', stats: { runs: 0, wickets: 13, catches: 2, price: 5.00 } },
    { id: 48, name: 'Mohammad Nabi', team: teams.MI, role: 'All-Rounder', isOverseas: true, image: 'https://placehold.co/300x400?text=Nabi', stats: { runs: 35, wickets: 2, catches: 3, price: 1.50 } },

    // LSG
    { id: 49, name: 'KL Rahul', team: teams.LSG, role: 'Wicketkeeper', isOverseas: false, image: 'https://placehold.co/300x400?text=Rahul', stats: { runs: 520, wickets: 0, catches: 11, price: 17.00 } },
    { id: 50, name: 'Nicholas Pooran', team: teams.LSG, role: 'Wicketkeeper', isOverseas: true, image: 'https://placehold.co/300x400?text=Pooran', stats: { runs: 499, wickets: 0, catches: 4, price: 16.00 } },
    { id: 51, name: 'Marcus Stoinis', team: teams.LSG, role: 'All-Rounder', isOverseas: true, image: 'https://placehold.co/300x400?text=Stoinis', stats: { runs: 388, wickets: 4, catches: 5, price: 9.20 } },
    { id: 52, name: 'Quinton de Kock', team: teams.LSG, role: 'Wicketkeeper', isOverseas: true, image: 'https://placehold.co/300x400?text=QDK', stats: { runs: 250, wickets: 0, catches: 6, price: 6.75 } },
    { id: 53, name: 'Ayush Badoni', team: teams.LSG, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Badoni', stats: { runs: 185, wickets: 0, catches: 4, price: 0.20 } },
    { id: 54, name: 'Ravi Bishnoi', team: teams.LSG, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Bishnoi', stats: { runs: 0, wickets: 10, catches: 3, price: 4.00 } },
    { id: 55, name: 'Yash Thakur', team: teams.LSG, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Thakur', stats: { runs: 0, wickets: 11, catches: 2, price: 0.45 } },
    { id: 56, name: 'Naveen-ul-Haq', team: teams.LSG, role: 'Bowler', isOverseas: true, image: 'https://placehold.co/300x400?text=Naveen', stats: { runs: 0, wickets: 14, catches: 2, price: 0.50 } },

    // DC
    { id: 57, name: 'Rishabh Pant', team: teams.DC, role: 'Wicketkeeper', isOverseas: false, image: 'https://placehold.co/300x400?text=Pant', stats: { runs: 446, wickets: 0, catches: 11, price: 16.00 } },
    { id: 58, name: 'Tristan Stubbs', team: teams.DC, role: 'Batter', isOverseas: true, image: 'https://placehold.co/300x400?text=Stubbs', stats: { runs: 378, wickets: 3, catches: 5, price: 0.50 } },
    { id: 59, name: 'Jake Fraser-McGurk', team: teams.DC, role: 'Batter', isOverseas: true, image: 'https://placehold.co/300x400?text=Jake', stats: { runs: 330, wickets: 0, catches: 6, price: 0.50 } },
    { id: 60, name: 'Abishek Porel', team: teams.DC, role: 'Wicketkeeper', isOverseas: false, image: 'https://placehold.co/300x400?text=Porel', stats: { runs: 327, wickets: 0, catches: 4, price: 0.20 } },
    { id: 61, name: 'Axar Patel', team: teams.DC, role: 'All-Rounder', isOverseas: false, image: 'https://placehold.co/300x400?text=Axar', stats: { runs: 235, wickets: 11, catches: 5, price: 9.00 } },
    { id: 62, name: 'Kuldeep Yadav', team: teams.DC, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Kuldeep', stats: { runs: 0, wickets: 16, catches: 2, price: 5.25 } },
    { id: 63, name: 'Khaleel Ahmed', team: teams.DC, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Khaleel', stats: { runs: 0, wickets: 17, catches: 2, price: 5.25 } },
    { id: 64, name: 'Mukesh Kumar', team: teams.DC, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Mukesh', stats: { runs: 0, wickets: 17, catches: 3, price: 5.50 } },

    // GT
    { id: 65, name: 'Shubman Gill', team: teams.GT, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Gill', stats: { runs: 426, wickets: 0, catches: 6, price: 8.00 } },
    { id: 66, name: 'Sai Sudharsan', team: teams.GT, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Sai', stats: { runs: 527, wickets: 0, catches: 4, price: 0.20 } },
    { id: 67, name: 'David Miller', team: teams.GT, role: 'Batter', isOverseas: true, image: 'https://placehold.co/300x400?text=Miller', stats: { runs: 210, wickets: 0, catches: 5, price: 3.00 } },
    { id: 68, name: 'Rahul Tewatia', team: teams.GT, role: 'All-Rounder', isOverseas: false, image: 'https://placehold.co/300x400?text=Tewatia', stats: { runs: 188, wickets: 0, catches: 4, price: 9.00 } },
    { id: 69, name: 'Rashid Khan', team: teams.GT, role: 'All-Rounder', isOverseas: true, image: 'https://placehold.co/300x400?text=Rashid', stats: { runs: 102, wickets: 10, catches: 6, price: 15.00 } },
    { id: 70, name: 'Mohit Sharma', team: teams.GT, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Mohit', stats: { runs: 0, wickets: 13, catches: 2, price: 0.50 } },
    { id: 71, name: 'Noor Ahmad', team: teams.GT, role: 'Bowler', isOverseas: true, image: 'https://placehold.co/300x400?text=Noor', stats: { runs: 0, wickets: 8, catches: 1, price: 0.30 } },
    { id: 72, name: 'Umesh Yadav', team: teams.GT, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Umesh', stats: { runs: 0, wickets: 8, catches: 2, price: 5.80 } },

    // PBKS
    { id: 73, name: 'Shashank Singh', team: teams.PBKS, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Shashank', stats: { runs: 354, wickets: 0, catches: 4, price: 0.20 } },
    { id: 74, name: 'Prabhsimran Singh', team: teams.PBKS, role: 'Wicketkeeper', isOverseas: false, image: 'https://placehold.co/300x400?text=Prabhsimran', stats: { runs: 334, wickets: 0, catches: 3, price: 0.60 } },
    { id: 75, name: 'Jonny Bairstow', team: teams.PBKS, role: 'Wicketkeeper', isOverseas: true, image: 'https://placehold.co/300x400?text=Bairstow', stats: { runs: 298, wickets: 0, catches: 4, price: 6.75 } },
    { id: 76, name: 'Sam Curran', team: teams.PBKS, role: 'All-Rounder', isOverseas: true, image: 'https://placehold.co/300x400?text=Curran', stats: { runs: 270, wickets: 16, catches: 6, price: 18.50 } },
    { id: 77, name: 'Harshal Patel', team: teams.PBKS, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Harshal', stats: { runs: 0, wickets: 24, catches: 4, price: 11.75 } },
    { id: 78, name: 'Arshdeep Singh', team: teams.PBKS, role: 'Bowler', isOverseas: false, image: 'https://placehold.co/300x400?text=Arshdeep', stats: { runs: 0, wickets: 19, catches: 3, price: 4.00 } },
    { id: 79, name: 'Kagiso Rabada', team: teams.PBKS, role: 'Bowler', isOverseas: true, image: 'https://placehold.co/300x400?text=Rabada', stats: { runs: 0, wickets: 11, catches: 2, price: 9.25 } },
    { id: 80, name: 'Ashutosh Sharma', team: teams.PBKS, role: 'Batter', isOverseas: false, image: 'https://placehold.co/300x400?text=Ashutosh', stats: { runs: 189, wickets: 0, catches: 2, price: 0.20 } },
];
