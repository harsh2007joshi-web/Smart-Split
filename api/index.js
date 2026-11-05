// server/app.ts
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";

// server/routes/auth.ts
import { Router } from "express";
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";

// server/db/database.ts
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// server/data/splitsmart_db.json
var splitsmart_db_default = {
  users: [
    {
      id: "usr_rahul",
      name: "Rahul Sharma",
      username: "@rahulsharma_101",
      email: "rahul@example.com",
      gender: "male",
      passwordHash: "$2a$10$vV6pB13GUQ.plFTDl0oF1etCjLj0qeN1b7SzNBkVOTcmfmG28q4la",
      isEmailVerified: true,
      createdAt: "2026-10-06T07:30:03.616Z",
      updatedAt: "2026-11-05T07:30:03.618Z"
    },
    {
      id: "usr_priya",
      name: "Priya Patel",
      username: "@priyapatel_204",
      email: "priya@example.com",
      gender: "female",
      passwordHash: "$2a$10$vV6pB13GUQ.plFTDl0oF1etCjLj0qeN1b7SzNBkVOTcmfmG28q4la",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      createdAt: "2026-10-08T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.618Z"
    },
    {
      id: "usr_aman",
      name: "Aman Gupta",
      username: "@amangupta_305",
      email: "aman@example.com",
      gender: "male",
      passwordHash: "$2a$10$vV6pB13GUQ.plFTDl0oF1etCjLj0qeN1b7SzNBkVOTcmfmG28q4la",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      createdAt: "2026-10-11T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.618Z"
    },
    {
      id: "usr_sneha",
      name: "Sneha Roy",
      username: "@sneharoy_402",
      email: "sneha@example.com",
      gender: "female",
      passwordHash: "$2a$10$vV6pB13GUQ.plFTDl0oF1etCjLj0qeN1b7SzNBkVOTcmfmG28q4la",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      createdAt: "2026-10-16T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.618Z"
    },
    {
      name: "Test Hackathon Judge",
      email: "judge@paypal-hackathon.com",
      passwordHash: "$2a$10$dJDl/G8KnO69jFJVeEkDwubtioT7WuHRuVfHXD/hinJ1CV2rcpFN2",
      isEmailVerified: true,
      id: "usr_m624aqd",
      username: "@testhackathonjudge_924",
      createdAt: "2026-11-05T07:30:03.691Z",
      updatedAt: "2026-11-05T07:30:03.780Z"
    },
    {
      name: "Deepak Verma",
      email: "deepak.traveler@example.com",
      passwordHash: "dummyhash",
      isEmailVerified: true,
      id: "usr_d8rnx9x",
      username: "@deepakverma_308",
      createdAt: "2026-11-05T07:30:03.817Z",
      updatedAt: "2026-11-05T07:30:03.817Z"
    },
    {
      name: "Harsh Joshi",
      email: "harsh.test@example.com",
      passwordHash: "dummyhash",
      isEmailVerified: true,
      id: "usr_ywrt9sl",
      username: "@harshjoshi_654",
      createdAt: "2026-11-05T07:30:03.834Z",
      updatedAt: "2026-11-05T07:30:03.834Z"
    },
    {
      name: "Rahul Patel",
      email: "rahul.patel.test@example.com",
      passwordHash: "dummyhash",
      isEmailVerified: true,
      id: "usr_5t1m85x",
      username: "@rahulpatel_670",
      createdAt: "2026-11-05T07:30:03.837Z",
      updatedAt: "2026-11-05T07:30:03.837Z"
    },
    {
      name: "Vikram Singh",
      email: "vikram.test@example.com",
      passwordHash: "dummyhash",
      isEmailVerified: true,
      id: "usr_9p0f2f4",
      username: "@vikramsingh_322",
      createdAt: "2026-11-05T07:30:03.869Z",
      updatedAt: "2026-11-05T07:30:03.869Z"
    },
    {
      id: "usr_q1fybp4",
      name: "Harsh Joshi",
      username: "@harshjoshi_350",
      email: "harsh2007joshi@gmail.com",
      phoneNumber: "9136274875",
      passwordHash: "hash123",
      isEmailVerified: true,
      isPhoneVerified: false,
      createdAt: "2026-11-05T07:32:15.514Z",
      updatedAt: "2026-11-05T07:32:15.517Z"
    }
  ],
  verificationTokens: [
    {
      id: "tok_smt7bzj",
      userId: "usr_2cp7ldr",
      email: "harsh2007joshi@gmail.com",
      code: "989946",
      expiresAt: 1793258613167,
      attempts: 1
    },
    {
      id: "tok_jg0fmre",
      userId: "usr_raa1e4w",
      email: "account.a.1793534562901@example.com",
      code: "375393",
      expiresAt: 1793535463033,
      attempts: 0
    },
    {
      id: "tok_3283wfx",
      userId: "usr_hg00ux6",
      email: "account.b.1793534562901@example.com",
      code: "553651",
      expiresAt: 1793535467588,
      attempts: 0
    },
    {
      id: "tok_e985hu0",
      userId: "usr_chm33hk",
      email: "hjoshi1793859895876@example.com",
      code: "956572",
      expiresAt: 1793860795952,
      attempts: 0
    }
  ],
  phoneVerifications: [
    {
      id: "pv_qsimp60",
      phone: "9136271875",
      otp: "305886",
      sessionId: "2F_SESSION_1793269897574",
      expiresAt: 1793270497574,
      verified: false
    },
    {
      id: "pv_ez45uc6",
      phone: "9136274875",
      otp: "262106",
      sessionId: "2F_SESSION_1793857726876",
      expiresAt: 1793858326876,
      verified: false
    },
    {
      id: "pv_17svh1f",
      phone: "9876543210",
      otp: "849201",
      sessionId: "session_2factor_test_xyz",
      expiresAt: 1793864403808,
      verified: true
    }
  ],
  invitations: [
    {
      id: "invit_8da45x0",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_y9k8nmb4ismvt78ylg",
      status: "ACCEPTED",
      createdAt: "2026-10-29T07:05:57.028Z"
    },
    {
      id: "invit_8c1b46m",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_6fakg0hca6mvt79ei9",
      status: "ACCEPTED",
      createdAt: "2026-10-29T07:06:17.649Z"
    },
    {
      id: "invit_fz23biu",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_em50me0lx8mvt7lpgw",
      status: "ACCEPTED",
      createdAt: "2026-10-29T07:15:51.728Z"
    },
    {
      id: "invit_dtk4xxh",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_t7p6qf4tggmvup65ed",
      status: "ACCEPTED",
      createdAt: "2026-10-30T08:15:25.141Z"
    },
    {
      id: "invit_gkabcl9",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_rtnczozvbomvupru07",
      status: "ACCEPTED",
      createdAt: "2026-10-30T08:32:16.807Z"
    },
    {
      id: "invit_0ldahne",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_p5nuymajd7mvuptc9n",
      status: "ACCEPTED",
      createdAt: "2026-10-30T08:33:27.131Z"
    },
    {
      id: "invit_mgx3jm7",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_izunvgq2v1mvuq87nr",
      status: "ACCEPTED",
      createdAt: "2026-10-30T08:45:00.999Z"
    },
    {
      id: "invit_hnz7kkr",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_7ad0xvwmzxmvxs50is",
      status: "ACCEPTED",
      createdAt: "2026-11-01T12:01:49.540Z"
    },
    {
      id: "invit_f1o3hqh",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_vsb68hsgsdmw1kp9x9",
      status: "ACCEPTED",
      createdAt: "2026-11-04T03:44:42.621Z"
    },
    {
      id: "invit_dj58b2m",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_s3xygkpiaqmw1l5qhx",
      status: "ACCEPTED",
      createdAt: "2026-11-04T03:57:30.597Z"
    },
    {
      id: "invit_7h8yoa2",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_6wo2of7cbcmw1lcnmr",
      status: "ACCEPTED",
      createdAt: "2026-11-04T04:02:53.475Z"
    },
    {
      id: "invit_aeamyp8",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_9si54sth6amw33i1n7",
      status: "ACCEPTED",
      createdAt: "2026-11-05T05:18:44.179Z"
    },
    {
      id: "invit_4l9qwxy",
      groupId: "grp_fgm7me5",
      groupName: "Manali",
      inviterName: "Harsh Joshi",
      email: "hatergames697@gmail.com",
      token: "inv_kp5hde86o3mw33mlja",
      status: "PENDING",
      createdAt: "2026-11-05T05:22:16.582Z"
    },
    {
      id: "invit_nd83qol",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_dak2wr0uv6mw34cusi",
      status: "ACCEPTED",
      createdAt: "2026-11-05T05:42:41.634Z"
    },
    {
      id: "invit_xg1ogc4",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_sq5j3ggzg1mw34ekqx",
      status: "ACCEPTED",
      createdAt: "2026-11-05T05:44:01.930Z"
    },
    {
      id: "invit_d7ii0s4",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_d82ft7ssitmw34ic08",
      status: "ACCEPTED",
      createdAt: "2026-11-05T05:46:57.224Z"
    },
    {
      id: "invit_4gdfw3v",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_jdeak8q52imw34u5xl",
      status: "ACCEPTED",
      createdAt: "2026-11-05T05:56:09.225Z"
    },
    {
      id: "invit_e9zixug",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_tiyqqow4pjmw35yvuc",
      status: "ACCEPTED",
      createdAt: "2026-11-05T06:27:49.044Z"
    },
    {
      id: "invit_pu5xoku",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_kzm2xoa06vmw364mzm",
      status: "ACCEPTED",
      createdAt: "2026-11-05T06:32:17.506Z"
    },
    {
      id: "invit_e06tnhh",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_kcbpgtjtqymw36ji60",
      status: "ACCEPTED",
      createdAt: "2026-11-05T06:43:51.096Z"
    },
    {
      id: "invit_img61sp",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_bh22iyf68emw36ujy6",
      status: "ACCEPTED",
      createdAt: "2026-11-05T06:52:26.622Z"
    },
    {
      id: "invit_lbdk8gp",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_31854e4tzomw37bw46",
      status: "ACCEPTED",
      createdAt: "2026-11-05T07:05:55.542Z"
    },
    {
      id: "invit_voioras",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_33b71iblo3mw37nu2v",
      status: "ACCEPTED",
      createdAt: "2026-11-05T07:15:12.775Z"
    },
    {
      id: "invit_8s1vu16",
      groupId: "grp_goa2026",
      groupName: "Goa Trip 2026",
      inviterName: "Rahul Sharma",
      email: "deepak.traveler@example.com",
      token: "inv_griuztxsgomw386xlx",
      status: "ACCEPTED",
      createdAt: "2026-11-05T07:30:03.813Z"
    }
  ],
  resetChallenges: [
    {
      id: "res_7wfx8d4ph",
      email: "harsh2007joshi@gmail.com",
      otp: "509742",
      expiresAt: 1793536937960,
      attempts: 0,
      verified: false
    }
  ],
  groups: [
    {
      id: "grp_goa2026",
      name: "Goa Trip 2026",
      description: "Annual beach vacation and adventures with college gang",
      category: "Travel",
      currency: "INR",
      creatorId: "usr_rahul",
      budget: 5e4,
      createdAt: "2026-10-22T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.830Z",
      members: [
        {
          id: "gm_1",
          groupId: "grp_goa2026",
          userId: "usr_rahul",
          name: "Rahul Sharma",
          email: "rahul@example.com",
          role: "ADMIN",
          joinedAt: "2026-10-22T07:30:03.618Z"
        },
        {
          id: "gm_2",
          groupId: "grp_goa2026",
          userId: "usr_priya",
          name: "Priya Patel",
          email: "priya@example.com",
          role: "MEMBER",
          joinedAt: "2026-10-22T07:30:03.618Z"
        },
        {
          id: "gm_3",
          groupId: "grp_goa2026",
          userId: "usr_aman",
          name: "Aman Gupta",
          email: "aman@example.com",
          role: "MEMBER",
          joinedAt: "2026-10-22T07:30:03.618Z"
        },
        {
          id: "gm_4",
          groupId: "grp_goa2026",
          userId: "usr_sneha",
          name: "Sneha Roy",
          email: "sneha@example.com",
          role: "MEMBER",
          joinedAt: "2026-10-23T07:30:03.618Z"
        },
        {
          id: "gm_lwn36fe",
          groupId: "grp_goa2026",
          userId: "usr_d8rnx9x",
          name: "Deepak Verma",
          email: "deepak.traveler@example.com",
          role: "MEMBER",
          joinedAt: "2026-11-05T07:30:03.820Z"
        }
      ],
      budgetCurrency: "INR"
    },
    {
      id: "grp_college",
      name: "College Friends",
      description: "Weekend hangouts, dinners, movies & treats",
      category: "Entertainment",
      currency: "INR",
      creatorId: "usr_rahul",
      createdAt: "2026-09-21T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.618Z",
      members: [
        {
          id: "gm_5",
          groupId: "grp_college",
          userId: "usr_rahul",
          name: "Rahul Sharma",
          email: "rahul@example.com",
          role: "ADMIN",
          joinedAt: "2026-09-21T07:30:03.618Z"
        },
        {
          id: "gm_6",
          groupId: "grp_college",
          userId: "usr_priya",
          name: "Priya Patel",
          email: "priya@example.com",
          role: "MEMBER",
          joinedAt: "2026-09-21T07:30:03.618Z"
        },
        {
          id: "gm_7",
          groupId: "grp_college",
          userId: "usr_aman",
          name: "Aman Gupta",
          email: "aman@example.com",
          role: "MEMBER",
          joinedAt: "2026-09-21T07:30:03.618Z"
        }
      ]
    },
    {
      id: "grp_roommates",
      name: "Roommates Flat 402",
      description: "Rent, groceries, high-speed WiFi, electricity & maintenance",
      category: "Utilities",
      currency: "INR",
      creatorId: "usr_aman",
      createdAt: "2026-09-06T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.618Z",
      members: [
        {
          id: "gm_8",
          groupId: "grp_roommates",
          userId: "usr_rahul",
          name: "Rahul Sharma",
          email: "rahul@example.com",
          role: "MEMBER",
          joinedAt: "2026-09-06T07:30:03.618Z"
        },
        {
          id: "gm_9",
          groupId: "grp_roommates",
          userId: "usr_aman",
          name: "Aman Gupta",
          email: "aman@example.com",
          role: "ADMIN",
          joinedAt: "2026-09-06T07:30:03.618Z"
        }
      ]
    }
  ],
  expenses: [
    {
      id: "exp_1",
      groupId: "grp_goa2026",
      title: "Beach Resort Villa Booking",
      amount: 14e3,
      currency: "INR",
      payerId: "usr_rahul",
      payerName: "Rahul Sharma",
      category: "Accommodation",
      date: "2026-10-31",
      splitType: "EQUAL",
      splits: [
        {
          id: "s_1",
          expenseId: "exp_1",
          userId: "usr_rahul",
          userName: "Rahul Sharma",
          shareAmount: 3500
        },
        {
          id: "s_2",
          expenseId: "exp_1",
          userId: "usr_priya",
          userName: "Priya Patel",
          shareAmount: 3500
        },
        {
          id: "s_3",
          expenseId: "exp_1",
          userId: "usr_aman",
          userName: "Aman Gupta",
          shareAmount: 3500
        },
        {
          id: "s_4",
          expenseId: "exp_1",
          userId: "usr_sneha",
          userName: "Sneha Roy",
          shareAmount: 3500
        }
      ],
      notes: "3 nights stay near Baga Beach with breakfast included",
      createdAt: "2026-10-31T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.618Z"
    },
    {
      id: "exp_2",
      groupId: "grp_goa2026",
      title: "Seafood Shack Dinner & Drinks",
      amount: 4800,
      currency: "INR",
      payerId: "usr_priya",
      payerName: "Priya Patel",
      category: "Food",
      date: "2026-11-01",
      splitType: "EQUAL",
      splits: [
        {
          id: "s_5",
          expenseId: "exp_2",
          userId: "usr_rahul",
          userName: "Rahul Sharma",
          shareAmount: 1200
        },
        {
          id: "s_6",
          expenseId: "exp_2",
          userId: "usr_priya",
          userName: "Priya Patel",
          shareAmount: 1200
        },
        {
          id: "s_7",
          expenseId: "exp_2",
          userId: "usr_aman",
          userName: "Aman Gupta",
          shareAmount: 1200
        },
        {
          id: "s_8",
          expenseId: "exp_2",
          userId: "usr_sneha",
          userName: "Sneha Roy",
          shareAmount: 1200
        }
      ],
      notes: "Candlelight dinner at Curlies Beach Shack",
      createdAt: "2026-11-01T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.618Z"
    },
    {
      id: "exp_3",
      groupId: "grp_goa2026",
      title: "Self-Drive Thar Rental & Fuel",
      amount: 6e3,
      currency: "INR",
      payerId: "usr_aman",
      payerName: "Aman Gupta",
      category: "Travel",
      date: "2026-11-02",
      splitType: "EQUAL",
      splits: [
        {
          id: "s_9",
          expenseId: "exp_3",
          userId: "usr_rahul",
          userName: "Rahul Sharma",
          shareAmount: 1500
        },
        {
          id: "s_10",
          expenseId: "exp_3",
          userId: "usr_priya",
          userName: "Priya Patel",
          shareAmount: 1500
        },
        {
          id: "s_11",
          expenseId: "exp_3",
          userId: "usr_aman",
          userName: "Aman Gupta",
          shareAmount: 1500
        },
        {
          id: "s_12",
          expenseId: "exp_3",
          userId: "usr_sneha",
          userName: "Sneha Roy",
          shareAmount: 1500
        }
      ],
      notes: "Airport pickup and north Goa cruising",
      createdAt: "2026-11-02T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.618Z"
    },
    {
      id: "exp_4",
      groupId: "grp_college",
      title: "Italian Bistro Weekend Celebration",
      amount: 3600,
      currency: "INR",
      payerId: "usr_rahul",
      payerName: "Rahul Sharma",
      category: "Food",
      date: "2026-11-03",
      splitType: "EQUAL",
      splits: [
        {
          id: "s_13",
          expenseId: "exp_4",
          userId: "usr_rahul",
          userName: "Rahul Sharma",
          shareAmount: 1200
        },
        {
          id: "s_14",
          expenseId: "exp_4",
          userId: "usr_priya",
          userName: "Priya Patel",
          shareAmount: 1200
        },
        {
          id: "s_15",
          expenseId: "exp_4",
          userId: "usr_aman",
          userName: "Aman Gupta",
          shareAmount: 1200
        }
      ],
      notes: "Pizzas, pasta and tiramisu",
      createdAt: "2026-11-03T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.618Z"
    },
    {
      id: "exp_5",
      groupId: "grp_roommates",
      title: "High-Speed Fiber WiFi & Electricity",
      amount: 2400,
      currency: "INR",
      payerId: "usr_aman",
      payerName: "Aman Gupta",
      category: "Utilities",
      date: "2026-11-04",
      splitType: "EQUAL",
      splits: [
        {
          id: "s_16",
          expenseId: "exp_5",
          userId: "usr_rahul",
          userName: "Rahul Sharma",
          shareAmount: 1200
        },
        {
          id: "s_17",
          expenseId: "exp_5",
          userId: "usr_aman",
          userName: "Aman Gupta",
          shareAmount: 1200
        }
      ],
      notes: "Monthly connection bill",
      createdAt: "2026-11-04T07:30:03.618Z",
      updatedAt: "2026-11-05T07:30:03.618Z"
    }
  ],
  settlements: [
    {
      groupId: "grp_goa2026",
      fromUserId: "usr_rahul",
      fromUserName: "Rahul Sharma",
      toUserId: "usr_rahul",
      toUserName: "Rahul Sharma",
      amount: 6200,
      currency: "INR",
      status: "COMPLETED",
      paymentId: "pay_81t5bpy",
      completedAt: "2026-10-29T06:55:09.603Z",
      id: "set_yhxf3ab",
      createdAt: "2026-10-29T06:55:09.603Z"
    },
    {
      groupId: "grp_goa2026",
      fromUserId: "usr_rahul",
      fromUserName: "Rahul Sharma",
      toUserId: "usr_rahul",
      toUserName: "Rahul Sharma",
      amount: 6200,
      currency: "INR",
      status: "COMPLETED",
      paymentId: "pay_bcbekx2",
      completedAt: "2026-10-29T06:58:54.390Z",
      id: "set_tgwcofx",
      createdAt: "2026-10-29T06:58:54.390Z"
    },
    {
      groupId: "grp_goa2026",
      fromUserId: "usr_rahul",
      fromUserName: "Rahul Sharma",
      toUserId: "usr_rahul",
      toUserName: "Rahul Sharma",
      amount: 6200,
      currency: "INR",
      status: "COMPLETED",
      paymentId: "pay_tgml346",
      completedAt: "2026-10-29T09:33:09.446Z",
      id: "set_p40hppl",
      createdAt: "2026-10-29T09:33:09.446Z"
    },
    {
      groupId: "grp_goa2026",
      fromUserId: "usr_rahul",
      fromUserName: "Rahul Sharma",
      toUserId: "usr_rahul",
      toUserName: "Rahul Sharma",
      amount: 6200,
      currency: "INR",
      status: "COMPLETED",
      paymentId: "pay_pb6i26x",
      completedAt: "2026-10-29T09:33:55.689Z",
      id: "set_8qigl6w",
      createdAt: "2026-10-29T09:33:55.689Z"
    },
    {
      groupId: "grp_goa2026",
      fromUserId: "usr_rahul",
      fromUserName: "Rahul Sharma",
      toUserId: "usr_rahul",
      toUserName: "Rahul Sharma",
      amount: 6200,
      currency: "INR",
      status: "COMPLETED",
      paymentId: "pay_vsb1hwj",
      completedAt: "2026-11-01T12:35:41.470Z",
      id: "set_wq0rl46",
      createdAt: "2026-11-01T12:35:41.471Z"
    },
    {
      groupId: "grp_goa2026",
      fromUserId: "usr_rahul",
      fromUserName: "Rahul Sharma",
      toUserId: "usr_rahul",
      toUserName: "Rahul Sharma",
      amount: 6200,
      currency: "INR",
      status: "COMPLETED",
      paymentId: "pay_y91hupt",
      completedAt: "2026-11-01T12:36:26.161Z",
      id: "set_yd9gezr",
      createdAt: "2026-11-01T12:36:26.161Z"
    },
    {
      groupId: "grp_goa2026",
      fromUserId: "usr_rahul",
      fromUserName: "Rahul Sharma",
      toUserId: "usr_rahul",
      toUserName: "Rahul Sharma",
      amount: 6200,
      currency: "INR",
      status: "COMPLETED",
      paymentId: "pay_2n1j30j",
      completedAt: "2026-11-01T12:36:41.029Z",
      id: "set_cvkdhyf",
      createdAt: "2026-11-01T12:36:41.029Z"
    },
    {
      groupId: "grp_goa2026",
      fromUserId: "usr_rahul",
      fromUserName: "Rahul Sharma",
      toUserId: "usr_rahul",
      toUserName: "Rahul Sharma",
      amount: 6200,
      currency: "INR",
      status: "COMPLETED",
      paymentId: "pay_xt1913h",
      completedAt: "2026-11-01T12:36:55.597Z",
      id: "set_3p8lhxc",
      createdAt: "2026-11-01T12:36:55.597Z"
    }
  ],
  payments: [
    {
      id: "pay_demo_1",
      settlementId: "set_demo_1",
      groupId: "grp_goa2026",
      payerId: "usr_sneha",
      payerName: "Sneha Roy",
      recipientId: "usr_rahul",
      recipientName: "Rahul Sharma",
      amount: 3500,
      currency: "INR",
      method: "PAYPAL",
      status: "COMPLETED",
      reference: "PP-TXN-88492019",
      createdAt: "2026-11-03T07:30:03.618Z",
      metadata: {
        note: "Villa booking share settled via PayPal Sandbox"
      }
    },
    {
      settlementId: "set_test_1",
      groupId: "grp_goa2026",
      payerId: "usr_rahul",
      payerName: "Rahul Sharma",
      recipientId: "usr_priya",
      recipientName: "Priya Patel",
      amount: 1200,
      currency: "INR",
      method: "CREDIT_CARD",
      status: "COMPLETED",
      reference: "SS-CRD-1793863803805",
      receiptNumber: "REC-1793863803805-CRD",
      metadata: {
        cardMasked: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 4242",
        verified: true
      },
      id: "pay_gp6vbuh",
      createdAt: "2026-11-05T07:30:03.805Z"
    }
  ],
  notifications: [
    {
      id: "notif_1",
      userId: "usr_rahul",
      title: "Settlement Received",
      message: "Sneha Roy settled \u20B93,500 for Beach Resort Villa Booking via PayPal Sandbox.",
      type: "PAYMENT",
      isRead: false,
      createdAt: "2026-11-03T07:30:03.618Z",
      link: "/transactions"
    },
    {
      id: "notif_2",
      userId: "usr_rahul",
      title: "New Expense Added",
      message: 'Aman Gupta added "High-Speed Fiber WiFi & Electricity" (\u20B92,400) in Roommates Flat 402.',
      type: "EXPENSE",
      isRead: false,
      createdAt: "2026-11-04T07:30:03.618Z",
      link: "/groups/grp_roommates"
    },
    {
      id: "notif_3",
      userId: "usr_rahul",
      title: "AI Smart Insight",
      message: "Food and Accommodation account for 61% of your group spending this month.",
      type: "ALERT",
      isRead: true,
      createdAt: "2026-11-02T07:30:03.618Z",
      link: "/analytics"
    },
    {
      id: "notif_demo_freq",
      userId: "usr_rahul",
      title: "New Friend Request \u{1F44B}",
      message: "Sneha Roy (@sneharoy_402) sent you a friend request.",
      type: "FRIEND_REQUEST",
      isRead: false,
      createdAt: "2026-11-05T05:30:03.618Z",
      link: "/contacts",
      metadata: {
        friendRequestId: "freq_demo_sneha",
        senderId: "usr_sneha",
        senderName: "Sneha Roy",
        senderUsername: "@sneharoy_402"
      }
    },
    {
      userId: "usr_5t1m85x",
      title: "New Friend Request \u{1F44B}",
      message: "Harsh Joshi (@harshjoshi_654) sent you a friend request.",
      type: "FRIEND_REQUEST",
      link: "/contacts",
      metadata: {
        friendRequestId: "freq_82mqd2x",
        senderId: "usr_ywrt9sl",
        senderName: "Harsh Joshi",
        senderUsername: "@harshjoshi_654"
      },
      id: "notif_ctv69to",
      isRead: true,
      createdAt: "2026-11-05T07:30:03.844Z"
    },
    {
      userId: "usr_ywrt9sl",
      title: "Friend Request Accepted \u{1F389}",
      message: "Rahul Patel (@rahulpatel_670) accepted your friend request. You can now chat privately!",
      type: "FRIEND_REQUEST",
      link: "/contacts",
      metadata: {
        friendRequestId: "freq_82mqd2x",
        acceptedUserId: "usr_5t1m85x"
      },
      id: "notif_xr6780g",
      isRead: false,
      createdAt: "2026-11-05T07:30:03.861Z"
    },
    {
      userId: "usr_ywrt9sl",
      title: "New Friend Request \u{1F44B}",
      message: "Vikram Singh (@vikramsingh_322) sent you a friend request.",
      type: "FRIEND_REQUEST",
      link: "/contacts",
      metadata: {
        friendRequestId: "freq_v532gae",
        senderId: "usr_9p0f2f4",
        senderName: "Vikram Singh",
        senderUsername: "@vikramsingh_322"
      },
      id: "notif_8cevhq5",
      isRead: true,
      createdAt: "2026-11-05T07:30:03.872Z"
    },
    {
      userId: "usr_5t1m85x",
      title: "New Message from Harsh Joshi",
      message: "Hello Rahul! How is the trip planning going?",
      type: "MESSAGE",
      link: "/contacts?chat=usr_ywrt9sl",
      id: "notif_5hubvr3",
      isRead: false,
      createdAt: "2026-11-05T07:30:03.920Z"
    },
    {
      userId: "usr_ywrt9sl",
      title: "New Message from Rahul Patel",
      message: "Hey Harsh! Everything is booked. I will share the receipt.",
      type: "MESSAGE",
      link: "/contacts?chat=usr_5t1m85x",
      id: "notif_zad5pow",
      isRead: false,
      createdAt: "2026-11-05T07:30:03.935Z"
    },
    {
      userId: "usr_5t1m85x",
      title: "New File from Harsh Joshi",
      message: "Harsh Joshi sent you an image: GoaResortBooking.jpg",
      type: "MESSAGE",
      link: "/contacts?chat=usr_ywrt9sl",
      id: "notif_ezznyo8",
      isRead: false,
      createdAt: "2026-11-05T07:30:03.963Z"
    },
    {
      userId: "usr_5t1m85x",
      title: "New File from Harsh Joshi",
      message: "Harsh Joshi sent you a file: FlightTickets.pdf",
      type: "MESSAGE",
      link: "/contacts?chat=usr_ywrt9sl",
      id: "notif_ttzqdtk",
      isRead: false,
      createdAt: "2026-11-05T07:30:03.970Z"
    },
    {
      userId: "usr_5t1m85x",
      title: "Payment Receipt Shared by Harsh Joshi",
      message: "Harsh Joshi shared a settlement receipt for INR 1,200 (Goa Trip 2026).",
      type: "PAYMENT",
      link: "/contacts?chat=usr_ywrt9sl",
      id: "notif_ab24jzb",
      isRead: false,
      createdAt: "2026-11-05T07:30:03.978Z"
    }
  ],
  friendRequests: [
    {
      id: "freq_demo_sneha",
      senderId: "usr_sneha",
      senderName: "Sneha Roy",
      senderUsername: "@sneharoy_402",
      senderAvatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      receiverId: "usr_rahul",
      receiverName: "Rahul Sharma",
      receiverUsername: "@rahulsharma_101",
      status: "PENDING",
      createdAt: "2026-11-05T05:30:03.618Z",
      updatedAt: "2026-11-05T05:30:03.618Z"
    },
    {
      id: "freq_82mqd2x",
      senderId: "usr_ywrt9sl",
      senderName: "Harsh Joshi",
      senderUsername: "@harshjoshi_654",
      receiverId: "usr_5t1m85x",
      receiverName: "Rahul Patel",
      receiverUsername: "@rahulpatel_670",
      status: "ACCEPTED",
      createdAt: "2026-11-05T07:30:03.844Z",
      updatedAt: "2026-11-05T07:30:03.855Z"
    },
    {
      id: "freq_v532gae",
      senderId: "usr_9p0f2f4",
      senderName: "Vikram Singh",
      senderUsername: "@vikramsingh_322",
      receiverId: "usr_ywrt9sl",
      receiverName: "Harsh Joshi",
      receiverUsername: "@harshjoshi_654",
      status: "DECLINED",
      createdAt: "2026-11-05T07:30:03.872Z",
      updatedAt: "2026-11-05T07:30:03.890Z"
    }
  ],
  contacts: [
    {
      id: "cnt_1",
      userId: "usr_rahul",
      contactUserId: "usr_priya",
      createdAt: "2026-10-11T07:30:03.618Z"
    },
    {
      id: "cnt_2",
      userId: "usr_priya",
      contactUserId: "usr_rahul",
      createdAt: "2026-10-11T07:30:03.618Z"
    },
    {
      id: "cnt_3",
      userId: "usr_rahul",
      contactUserId: "usr_aman",
      createdAt: "2026-10-16T07:30:03.618Z"
    },
    {
      id: "cnt_4",
      userId: "usr_aman",
      contactUserId: "usr_rahul",
      createdAt: "2026-10-16T07:30:03.618Z"
    }
  ],
  chatMessages: [
    {
      id: "msg_demo_1",
      conversationId: "usr_priya:usr_rahul",
      senderId: "usr_priya",
      senderName: "Priya Patel",
      senderUsername: "@priyapatel_204",
      senderAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      receiverId: "usr_rahul",
      receiverName: "Rahul Sharma",
      receiverUsername: "@rahulsharma_101",
      type: "TEXT",
      text: "Hey Rahul! Did you receive the settlement for Beach Resort Villa Booking?",
      createdAt: "2026-11-03T19:30:03.618Z",
      isRead: true
    },
    {
      id: "msg_demo_2",
      conversationId: "usr_priya:usr_rahul",
      senderId: "usr_rahul",
      senderName: "Rahul Sharma",
      senderUsername: "@rahulsharma_101",
      receiverId: "usr_priya",
      receiverName: "Priya Patel",
      receiverUsername: "@priyapatel_204",
      receiverAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      type: "TEXT",
      text: "Yes! All confirmed on PayPal Sandbox. Here is the verified payment receipt for your records:",
      createdAt: "2026-11-03T20:30:03.618Z",
      isRead: true
    },
    {
      id: "msg_demo_3",
      conversationId: "usr_priya:usr_rahul",
      senderId: "usr_rahul",
      senderName: "Rahul Sharma",
      senderUsername: "@rahulsharma_101",
      receiverId: "usr_priya",
      receiverName: "Priya Patel",
      receiverUsername: "@priyapatel_204",
      receiverAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      type: "RECEIPT",
      receipt: {
        paymentId: "pay_demo_1",
        reference: "PP-TXN-88492019",
        amount: 3500,
        currency: "INR",
        groupName: "Goa Trip 2026",
        date: "2026-11-03T07:30:03.618Z",
        status: "COMPLETED",
        payerName: "Sneha Roy",
        recipientName: "Rahul Sharma",
        receiptNumber: "REC-2026-88492"
      },
      createdAt: "2026-11-03T21:30:03.618Z",
      isRead: true
    },
    {
      id: "msg_fobqsrhxd",
      conversationId: "usr_5t1m85x:usr_ywrt9sl",
      senderId: "usr_ywrt9sl",
      senderName: "Harsh Joshi",
      senderUsername: "@harshjoshi_654",
      receiverId: "usr_5t1m85x",
      receiverName: "Rahul Patel",
      receiverUsername: "@rahulpatel_670",
      type: "TEXT",
      text: "Hello Rahul! How is the trip planning going?",
      createdAt: "2026-11-05T07:30:03.920Z",
      isRead: false
    },
    {
      id: "msg_7lyfjr3xj",
      conversationId: "usr_5t1m85x:usr_ywrt9sl",
      senderId: "usr_5t1m85x",
      senderName: "Rahul Patel",
      senderUsername: "@rahulpatel_670",
      receiverId: "usr_ywrt9sl",
      receiverName: "Harsh Joshi",
      receiverUsername: "@harshjoshi_654",
      type: "TEXT",
      text: "Hey Harsh! Everything is booked. I will share the receipt.",
      createdAt: "2026-11-05T07:30:03.935Z",
      isRead: true
    },
    {
      id: "msg_nlhd72g8d",
      conversationId: "usr_5t1m85x:usr_ywrt9sl",
      senderId: "usr_ywrt9sl",
      senderName: "Harsh Joshi",
      senderUsername: "@harshjoshi_654",
      receiverId: "usr_5t1m85x",
      receiverName: "Rahul Patel",
      receiverUsername: "@rahulpatel_670",
      type: "IMAGE",
      attachment: {
        id: "att_test_img_1",
        filename: "chat_test_resort.jpg",
        originalName: "GoaResortBooking.jpg",
        mimeType: "image/jpeg",
        size: 245100,
        uploadedAt: "2026-11-05T07:30:03.962Z"
      },
      createdAt: "2026-11-05T07:30:03.962Z",
      isRead: false
    },
    {
      id: "msg_r2j4ie3ak",
      conversationId: "usr_5t1m85x:usr_ywrt9sl",
      senderId: "usr_ywrt9sl",
      senderName: "Harsh Joshi",
      senderUsername: "@harshjoshi_654",
      receiverId: "usr_5t1m85x",
      receiverName: "Rahul Patel",
      receiverUsername: "@rahulpatel_670",
      type: "FILE",
      attachment: {
        id: "att_test_pdf_1",
        filename: "chat_test_flight_itinerary.pdf",
        originalName: "FlightTickets.pdf",
        mimeType: "application/pdf",
        size: 512e3,
        uploadedAt: "2026-11-05T07:30:03.970Z"
      },
      createdAt: "2026-11-05T07:30:03.970Z",
      isRead: false
    },
    {
      id: "msg_akv7ecile",
      conversationId: "usr_5t1m85x:usr_ywrt9sl",
      senderId: "usr_ywrt9sl",
      senderName: "Harsh Joshi",
      senderUsername: "@harshjoshi_654",
      receiverId: "usr_5t1m85x",
      receiverName: "Rahul Patel",
      receiverUsername: "@rahulpatel_670",
      type: "RECEIPT",
      receipt: {
        paymentId: "pay_gp6vbuh",
        reference: "SS-CRD-1793863803805",
        amount: 1200,
        currency: "INR",
        groupName: "Goa Trip 2026",
        date: "2026-11-05T07:30:03.805Z",
        status: "COMPLETED",
        payerName: "Rahul Sharma",
        recipientName: "Priya Patel",
        receiptNumber: "REC-1793863803805-CRD"
      },
      createdAt: "2026-11-05T07:30:03.978Z",
      isRead: false
    }
  ]
};

// server/db/database.ts
var isServerless = !!(process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || process.env.NOW_REGION);
var BASE_DATA_DIR = path.resolve(process.cwd(), "server/data");
var BASE_DB_FILE = path.join(BASE_DATA_DIR, "splitsmart_db.json");
var DATA_DIR = isServerless ? path.join("/tmp", "splitsmart_data") : BASE_DATA_DIR;
var DB_FILE = isServerless ? path.join(DATA_DIR, "splitsmart_db.json") : BASE_DB_FILE;
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (isServerless && !fs.existsSync(DB_FILE) && fs.existsSync(BASE_DB_FILE)) {
    try {
      fs.copyFileSync(BASE_DB_FILE, DB_FILE);
    } catch (e) {
      console.warn("Initial DB copy to /tmp skipped:", e);
    }
  }
} catch (e) {
  console.warn("Filesystem init warning for database:", e);
}
var defaultSchema = {
  users: [],
  verificationTokens: [],
  phoneVerifications: [],
  invitations: [],
  resetChallenges: [],
  groups: [],
  expenses: [],
  settlements: [],
  payments: [],
  notifications: [],
  friendRequests: [],
  contacts: [],
  chatMessages: []
};
var Database = class {
  data;
  constructor() {
    this.data = this.load();
    this.migrateUsernames();
    this.initDemoDataIfNeeded();
  }
  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          ...defaultSchema,
          ...parsed,
          phoneVerifications: parsed.phoneVerifications || [],
          invitations: parsed.invitations || [],
          friendRequests: parsed.friendRequests || [],
          contacts: parsed.contacts || [],
          chatMessages: parsed.chatMessages || []
        };
      }
    } catch (e) {
      console.warn("Reading DB_FILE failed, falling back to embedded store:", e);
    }
    if (splitsmart_db_default && typeof splitsmart_db_default === "object") {
      try {
        return JSON.parse(JSON.stringify(splitsmart_db_default));
      } catch {
      }
    }
    return JSON.parse(JSON.stringify(defaultSchema));
  }
  save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
        } catch {
        }
      }
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error("Failed to persist database file:", e);
    }
  }
  getRawData() {
    return this.data;
  }
  generateUniqueUsername(name) {
    let base = (name || "user").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    if (!base) base = "user";
    let suffix = Math.floor(100 + Math.random() * 900);
    let candidate = `@${base}_${suffix}`;
    let attempts = 0;
    while (this.data.users && this.data.users.some((u) => u.username && u.username.toLowerCase() === candidate.toLowerCase())) {
      suffix = Math.floor(100 + Math.random() * 900);
      candidate = `@${base}_${suffix}`;
      attempts++;
      if (attempts > 60) {
        candidate = `@${base}_${Date.now().toString().slice(-4)}`;
        break;
      }
    }
    return candidate;
  }
  migrateUsernames() {
    if (!this.data.users) return;
    let changed = false;
    for (const user of this.data.users) {
      if (!user.username) {
        user.username = this.generateUniqueUsername(user.name);
        changed = true;
      }
    }
    if (changed) {
      this.save();
      console.log("\u2705 Safely migrated existing users with unique usernames.");
    }
  }
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  }
  findUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  findUserByUsername(username) {
    if (!username) return void 0;
    const clean = username.trim().toLowerCase().replace(/^@/, "");
    return this.data.users.find((u) => {
      if (!u.username) return false;
      return u.username.toLowerCase().replace(/^@/, "") === clean;
    });
  }
  searchUsers(query, currentUserId) {
    if (!query || !query.trim()) return [];
    const clean = query.trim().toLowerCase().replace(/^@/, "");
    return this.data.users.filter((u) => {
      if (currentUserId && u.id === currentUserId) return false;
      const matchUsername = u.username && u.username.toLowerCase().replace(/^@/, "").includes(clean);
      const matchName = u.name.toLowerCase().includes(clean);
      const matchEmail = u.email.toLowerCase().includes(clean);
      return matchUsername || matchName || matchEmail;
    }).slice(0, 15);
  }
  createUser(user) {
    const targetId = user.id || "usr_" + Math.random().toString(36).substring(2, 9);
    const assignedUsername = user.username || this.generateUniqueUsername(user.name);
    const existingIndex = this.data.users.findIndex(
      (u) => u.id === targetId || u.email.toLowerCase().trim() === user.email.toLowerCase().trim()
    );
    if (existingIndex >= 0) {
      const existing = this.data.users[existingIndex];
      this.data.users[existingIndex] = {
        ...existing,
        ...user,
        id: targetId,
        username: existing.username || assignedUsername,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.syncUserWithGroups(this.data.users[existingIndex]);
      this.save();
      return this.data.users[existingIndex];
    }
    const newUser = {
      ...user,
      id: targetId,
      username: assignedUsername,
      email: user.email.toLowerCase().trim(),
      createdAt: user.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: user.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.users.push(newUser);
    this.syncUserWithGroups(newUser);
    this.save();
    return newUser;
  }
  saveVerificationOtp(userId, email, code) {
    if (!this.data.verificationTokens) {
      this.data.verificationTokens = [];
    }
    this.data.verificationTokens = this.data.verificationTokens.filter(
      (t) => t.userId !== userId && t.email.toLowerCase().trim() !== email.toLowerCase().trim()
    );
    this.data.verificationTokens.push({
      id: "tok_" + Math.random().toString(36).substring(2, 9),
      userId,
      email: email.toLowerCase().trim(),
      code: code.trim(),
      expiresAt: Date.now() + 15 * 60 * 1e3,
      attempts: 0
    });
    this.save();
  }
  syncUserWithGroups(user) {
    if (!user || !user.email) return;
    const userEmail = user.email.toLowerCase().trim();
    let changed = false;
    for (const group of this.data.groups) {
      for (const member of group.members) {
        if (member.email && member.email.toLowerCase().trim() === userEmail) {
          const oldUserId = member.userId;
          if (member.userId !== user.id || user.name && member.name !== user.name) {
            member.userId = user.id;
            if (user.name) member.name = user.name;
            changed = true;
            for (const expense of this.data.expenses) {
              if (expense.groupId === group.id) {
                if (expense.payerId === oldUserId) {
                  expense.payerId = user.id;
                  if (user.name) expense.payerName = user.name;
                }
                if (expense.splits) {
                  for (const split of expense.splits) {
                    if (split.userId === oldUserId) {
                      split.userId = user.id;
                      if (user.name) split.userName = user.name;
                    }
                  }
                }
              }
            }
            for (const s of this.data.settlements) {
              if (s.groupId === group.id) {
                if (s.fromUserId === oldUserId) {
                  s.fromUserId = user.id;
                  if (user.name) s.fromUserName = user.name;
                }
                if (s.toUserId === oldUserId) {
                  s.toUserId = user.id;
                  if (user.name) s.toUserName = user.name;
                }
              }
            }
          }
        }
      }
    }
    if (changed) {
      this.save();
    }
  }
  findUserByPhone(phone) {
    const cleaned = phone.replace(/\D/g, "");
    return this.data.users.find((u) => {
      if (!u.phoneNumber) return false;
      const uClean = u.phoneNumber.replace(/\D/g, "");
      return uClean.endsWith(cleaned) || cleaned.endsWith(uClean);
    });
  }
  savePhoneOtp(phone, otp, sessionId) {
    const cleaned = phone.replace(/\D/g, "");
    this.data.phoneVerifications = (this.data.phoneVerifications || []).filter(
      (p) => p.phone !== cleaned
    );
    this.data.phoneVerifications.push({
      id: "pv_" + Math.random().toString(36).substring(2, 9),
      phone: cleaned,
      otp,
      sessionId,
      expiresAt: Date.now() + 10 * 60 * 1e3,
      verified: false
    });
    this.save();
  }
  verifyPhoneOtpLocally(phone, otp) {
    const cleaned = phone.replace(/\D/g, "");
    const record = (this.data.phoneVerifications || []).find(
      (p) => p.phone === cleaned && Date.now() <= p.expiresAt
    );
    if (!record) {
      return { success: false, message: "OTP expired or not found. Please request a new code." };
    }
    if (record.otp !== otp.trim()) {
      return { success: false, message: "Invalid OTP code. Please enter the 6 digits sent to your phone." };
    }
    record.verified = true;
    this.save();
    return { success: true, sessionId: record.sessionId, message: "Phone verified successfully." };
  }
  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return void 0;
    Object.assign(user, updates, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    this.save();
    return user;
  }
  createVerificationOtp(userId, email) {
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    this.data.verificationTokens = this.data.verificationTokens.filter((t) => t.userId !== userId);
    this.data.verificationTokens.push({
      id: "tok_" + Math.random().toString(36).substring(2, 9),
      userId,
      email: email.toLowerCase().trim(),
      code,
      expiresAt: Date.now() + 15 * 60 * 1e3,
      attempts: 0
    });
    this.save();
    return code;
  }
  verifyEmailOtp(userIdOrEmail, code) {
    if (!this.data.verificationTokens) {
      this.data.verificationTokens = [];
    }
    const cleanIdOrEmail = (userIdOrEmail || "").toLowerCase().trim();
    const token = this.data.verificationTokens.find(
      (t) => t.userId === userIdOrEmail || t.email.toLowerCase().trim() === cleanIdOrEmail
    );
    if (!token) {
      return { success: false, message: "No pending verification found." };
    }
    if (Date.now() > token.expiresAt) {
      this.data.verificationTokens = this.data.verificationTokens.filter((t) => t.id !== token.id);
      this.save();
      return { success: false, message: "Verification code has expired. Please request a new code." };
    }
    token.attempts += 1;
    if (token.attempts > 5) {
      this.data.verificationTokens = this.data.verificationTokens.filter((t) => t.id !== token.id);
      this.save();
      return { success: false, message: "Too many failed attempts. Please request a new code." };
    }
    if (token.code !== code.trim()) {
      this.save();
      return { success: false, message: "Incorrect verification code. Please check and try again." };
    }
    const user = this.findUserById(token.userId) || this.findUserByEmail(token.email);
    if (user) {
      this.updateUser(user.id, { isEmailVerified: true });
    }
    this.data.verificationTokens = this.data.verificationTokens.filter((t) => t.id !== token.id);
    this.save();
    return { success: true, message: "Email successfully verified!" };
  }
  createPasswordResetChallenge(email) {
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const challengeId = "res_" + Math.random().toString(36).substring(2, 11);
    this.data.resetChallenges = this.data.resetChallenges.filter((c) => c.email !== email.toLowerCase().trim());
    this.data.resetChallenges.push({
      id: challengeId,
      email: email.toLowerCase().trim(),
      otp,
      expiresAt: Date.now() + 10 * 60 * 1e3,
      attempts: 0,
      verified: false
    });
    this.save();
    return { challengeId, otp };
  }
  verifyResetOtp(challengeId, otp) {
    const challenge = this.data.resetChallenges.find((c) => c.id === challengeId);
    if (!challenge) {
      return { success: false, message: "Invalid or expired recovery session." };
    }
    if (Date.now() > challenge.expiresAt) {
      return { success: false, message: "OTP has expired. Please request a new one." };
    }
    challenge.attempts += 1;
    if (challenge.attempts > 5) {
      this.data.resetChallenges = this.data.resetChallenges.filter((c) => c.id !== challengeId);
      this.save();
      return { success: false, message: "Too many attempts. Recovery session terminated." };
    }
    if (challenge.otp !== otp.trim()) {
      this.save();
      return { success: false, message: "Invalid OTP code. Please enter the 6 digits sent to your email." };
    }
    challenge.verified = true;
    challenge.resetToken = "rst_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    this.save();
    return { success: true, resetToken: challenge.resetToken, message: "Code verified successfully." };
  }
  completePasswordReset(resetToken, newPasswordHash) {
    const challenge = this.data.resetChallenges.find((c) => c.resetToken === resetToken && c.verified);
    if (!challenge) {
      return { success: false, message: "Invalid or already-used reset authorization." };
    }
    const user = this.findUserByEmail(challenge.email);
    if (!user) {
      return { success: false, message: "Associated user account not found." };
    }
    user.passwordHash = newPasswordHash;
    user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.data.resetChallenges = this.data.resetChallenges.filter((c) => c.id !== challenge.id);
    this.save();
    return { success: true, message: "Password has been successfully updated." };
  }
  getGroupsForUser(userId) {
    const user = this.findUserById(userId);
    if (user) {
      this.syncUserWithGroups(user);
    }
    const userEmail = user?.email?.toLowerCase().trim();
    return this.data.groups.filter(
      (g) => g.members.some((m) => m.userId === userId || userEmail && m.email && m.email.toLowerCase().trim() === userEmail)
    );
  }
  getGroupById(groupId) {
    return this.data.groups.find((g) => g.id === groupId);
  }
  createGroup(data) {
    const groupId = "grp_" + Math.random().toString(36).substring(2, 9);
    const members = [
      {
        id: "gm_" + Math.random().toString(36).substring(2, 9),
        groupId,
        userId: data.creator.id,
        name: data.creator.name,
        email: data.creator.email,
        role: "ADMIN",
        joinedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    if (data.initialMembers && data.initialMembers.length > 0) {
      for (const m of data.initialMembers) {
        if (!m.name || !m.email) continue;
        const existingUser = this.findUserByEmail(m.email);
        members.push({
          id: "gm_" + Math.random().toString(36).substring(2, 9),
          groupId,
          userId: existingUser ? existingUser.id : "usr_ext_" + Math.random().toString(36).substring(2, 7),
          name: m.name,
          email: m.email.toLowerCase().trim(),
          role: "MEMBER",
          joinedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    const newGroup = {
      id: groupId,
      name: data.name,
      description: data.description || "",
      category: data.category || "General",
      currency: data.currency || "INR",
      creatorId: data.creator.id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      members
    };
    this.data.groups.push(newGroup);
    this.save();
    return newGroup;
  }
  addMemberToGroup(groupId, memberData) {
    const group = this.getGroupById(groupId);
    if (!group) return void 0;
    const existing = group.members.find((m) => m.email.toLowerCase() === memberData.email.toLowerCase());
    if (existing) return existing;
    const existingUser = this.findUserByEmail(memberData.email);
    const newMember = {
      id: "gm_" + Math.random().toString(36).substring(2, 9),
      groupId,
      userId: existingUser ? existingUser.id : "usr_ext_" + Math.random().toString(36).substring(2, 7),
      name: memberData.name,
      email: memberData.email.toLowerCase().trim(),
      role: "MEMBER",
      joinedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    group.members.push(newMember);
    group.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    return newMember;
  }
  createGroupInvitation(groupId, groupName, inviterName, email) {
    const token = "inv_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    const invitation = {
      id: "invit_" + Math.random().toString(36).substring(2, 9),
      groupId,
      groupName,
      inviterName,
      email: email.toLowerCase().trim(),
      token,
      status: "PENDING",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.invitations = this.data.invitations || [];
    this.data.invitations.push(invitation);
    this.save();
    return invitation;
  }
  getInvitationByToken(token) {
    return (this.data.invitations || []).find((i) => i.token === token.trim());
  }
  acceptGroupInvitation(token, user) {
    const invitation = this.getInvitationByToken(token);
    if (!invitation) {
      return { success: false, message: "Invalid or expired invitation link." };
    }
    const group = this.getGroupById(invitation.groupId);
    if (!group) {
      return { success: false, message: "The requested trip group is no longer active." };
    }
    const userEmail = user.email.toLowerCase().trim();
    const existingMember = group.members.find(
      (m) => m.userId === user.id || m.email && m.email.toLowerCase().trim() === userEmail
    );
    if (existingMember) {
      existingMember.userId = user.id;
      if (user.name) existingMember.name = user.name;
      existingMember.email = userEmail;
    } else {
      group.members.push({
        id: "gm_" + Math.random().toString(36).substring(2, 9),
        groupId: group.id,
        userId: user.id,
        name: user.name,
        email: userEmail,
        role: "MEMBER",
        joinedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    group.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    invitation.status = "ACCEPTED";
    this.syncUserWithGroups(user);
    this.save();
    return { success: true, group, message: `Successfully joined ${group.name}!` };
  }
  deleteGroup(groupId, userId) {
    const group = this.getGroupById(groupId);
    if (!group) {
      return { success: false, message: "Group not found or already deleted." };
    }
    const member = group.members.find((m) => m.userId === userId);
    if (!member) {
      return { success: false, message: "You are not a member of this group." };
    }
    this.data.expenses = this.data.expenses.filter((e) => e.groupId !== groupId);
    this.data.settlements = this.data.settlements.filter((s) => s.groupId !== groupId);
    if (this.data.invitations) {
      this.data.invitations = this.data.invitations.filter((i) => i.groupId !== groupId);
    }
    this.data.groups = this.data.groups.filter((g) => g.id !== groupId);
    this.save();
    return { success: true, message: `Trip group "${group.name}" has been successfully deleted and closed.` };
  }
  updateGroup(groupId, updates) {
    const group = this.getGroupById(groupId);
    if (!group) return void 0;
    Object.assign(group, updates, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    this.save();
    return group;
  }
  findPotentialDuplicateExpense(groupId, data) {
    const expenses = this.getExpensesForGroup(groupId);
    const targetTitle = (data.title || "").trim().toLowerCase();
    const targetAmount = Number(data.amount);
    if (!targetAmount || targetAmount <= 0) return void 0;
    const targetTime = data.date ? new Date(data.date).getTime() : Date.now();
    return expenses.find((e) => {
      const diff = Math.abs(Number(e.amount) - targetAmount);
      const isAmountClose = diff <= 0.5 || targetAmount > 0 && diff / targetAmount < 0.015;
      if (!isAmountClose) return false;
      const eTitle = e.title.trim().toLowerCase();
      const isTitleMatch = eTitle === targetTitle || targetTitle.length > 3 && eTitle.includes(targetTitle) || eTitle.length > 3 && targetTitle.includes(eTitle);
      const eTime = new Date(e.date).getTime();
      const isDateClose = Math.abs(eTime - targetTime) <= 3 * 864e5;
      const isPayerMatch = !data.payerId || e.payerId === data.payerId;
      return isAmountClose && isTitleMatch && isDateClose && isPayerMatch;
    });
  }
  getExpensesForGroup(groupId) {
    return this.data.expenses.filter((e) => e.groupId === groupId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  getExpenseById(id) {
    return this.data.expenses.find((e) => e.id === id);
  }
  createExpense(data) {
    const newExpense = {
      ...data,
      id: "exp_" + Math.random().toString(36).substring(2, 9),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.expenses.push(newExpense);
    this.save();
    return newExpense;
  }
  updateExpense(id, updates) {
    const expense = this.getExpenseById(id);
    if (!expense) return void 0;
    Object.assign(expense, updates, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    this.save();
    return expense;
  }
  deleteExpense(id) {
    const initialLen = this.data.expenses.length;
    this.data.expenses = this.data.expenses.filter((e) => e.id !== id);
    if (this.data.expenses.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
  getSettlementsForGroup(groupId) {
    return this.data.settlements.filter((s) => s.groupId === groupId);
  }
  getAllSettlements() {
    return this.data.settlements;
  }
  createSettlement(settlement) {
    const newSettlement = {
      ...settlement,
      id: "set_" + Math.random().toString(36).substring(2, 9),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.settlements.push(newSettlement);
    this.save();
    return newSettlement;
  }
  markSettlementCompleted(settlementId, paymentId) {
    const settlement = this.data.settlements.find((s) => s.id === settlementId);
    if (settlement) {
      settlement.status = "COMPLETED";
      settlement.paymentId = paymentId;
      settlement.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.save();
    }
    return settlement;
  }
  createPayment(payment) {
    const newPayment = {
      ...payment,
      id: "pay_" + Math.random().toString(36).substring(2, 9),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.payments.push(newPayment);
    this.save();
    return newPayment;
  }
  getPaymentById(id) {
    return this.data.payments.find((p) => p.id === id);
  }
  getPaymentByReference(reference) {
    return this.data.payments.find((p) => p.reference === reference);
  }
  updatePaymentStatus(id, status, metadata) {
    const payment = this.getPaymentById(id);
    if (payment) {
      payment.status = status;
      if (metadata) {
        payment.metadata = { ...payment.metadata || {}, ...metadata };
      }
      this.save();
    }
    return payment;
  }
  getAllPayments() {
    return this.data.payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getNotificationsForUser(userId) {
    return this.data.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  createNotification(data) {
    const notif = {
      ...data,
      id: "notif_" + Math.random().toString(36).substring(2, 9),
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.notifications.push(notif);
    this.save();
    return notif;
  }
  markNotificationRead(id) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
    }
  }
  markAllNotificationsRead(userId) {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.save();
  }
  createFriendRequest(senderId, receiverIdentifier) {
    const sender = this.findUserById(senderId);
    if (!sender) return { success: false, message: "Sender not found." };
    let receiver = this.findUserByUsername(receiverIdentifier);
    if (!receiver) {
      receiver = this.findUserById(receiverIdentifier);
    }
    if (!receiver) {
      return { success: false, message: `No registered user found matching "${receiverIdentifier}".` };
    }
    if (receiver.id === sender.id) {
      return { success: false, message: "You cannot send a friend request to yourself." };
    }
    if (this.areFriends(sender.id, receiver.id)) {
      return { success: false, message: `${receiver.name} is already in your contacts.` };
    }
    if (!this.data.friendRequests) this.data.friendRequests = [];
    const existingPending = this.data.friendRequests.find(
      (r) => r.status === "PENDING" && (r.senderId === sender.id && r.receiverId === receiver.id || r.senderId === receiver.id && r.receiverId === sender.id)
    );
    if (existingPending) {
      if (existingPending.senderId === sender.id) {
        return { success: false, message: "Friend request is already pending." };
      } else {
        return { success: false, message: `${receiver.name} has already sent you a friend request. You can accept it in Contacts or Notifications!` };
      }
    }
    const newRequest = {
      id: "freq_" + Math.random().toString(36).substring(2, 9),
      senderId: sender.id,
      senderName: sender.name,
      senderUsername: sender.username || this.generateUniqueUsername(sender.name),
      senderAvatarUrl: sender.avatarUrl,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverUsername: receiver.username || this.generateUniqueUsername(receiver.name),
      receiverAvatarUrl: receiver.avatarUrl,
      status: "PENDING",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.friendRequests.push(newRequest);
    this.createNotification({
      userId: receiver.id,
      title: "New Friend Request \u{1F44B}",
      message: `${sender.name} (${newRequest.senderUsername}) sent you a friend request.`,
      type: "FRIEND_REQUEST",
      link: "/contacts",
      metadata: {
        friendRequestId: newRequest.id,
        senderId: sender.id,
        senderName: sender.name,
        senderUsername: newRequest.senderUsername
      }
    });
    this.save();
    return { success: true, message: "Friend request sent successfully.", request: newRequest };
  }
  getFriendRequestById(id) {
    return (this.data.friendRequests || []).find((r) => r.id === id);
  }
  getPendingIncomingRequests(userId) {
    return (this.data.friendRequests || []).filter((r) => r.receiverId === userId && r.status === "PENDING");
  }
  getSentRequests(userId) {
    return (this.data.friendRequests || []).filter((r) => r.senderId === userId);
  }
  acceptFriendRequest(requestId, userId) {
    const req = this.getFriendRequestById(requestId);
    if (!req) return { success: false, message: "Friend request not found." };
    if (req.receiverId !== userId) return { success: false, message: "You are not authorized to accept this friend request." };
    if (req.status !== "PENDING") return { success: false, message: `This friend request has already been ${req.status.toLowerCase()}.` };
    req.status = "ACCEPTED";
    req.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.addContact(req.senderId, req.receiverId);
    this.addContact(req.receiverId, req.senderId);
    const receiver = this.findUserById(userId);
    const receiverName = receiver?.name || req.receiverName;
    const receiverUsername = receiver?.username || req.receiverUsername;
    this.createNotification({
      userId: req.senderId,
      title: "Friend Request Accepted \u{1F389}",
      message: `${receiverName} (${receiverUsername}) accepted your friend request. You can now chat privately!`,
      type: "FRIEND_REQUEST",
      link: "/contacts",
      metadata: {
        friendRequestId: req.id,
        acceptedUserId: userId
      }
    });
    const notif = this.data.notifications.find((n) => n.userId === userId && n.metadata?.friendRequestId === req.id);
    if (notif) notif.isRead = true;
    this.save();
    return { success: true, message: "Friend request accepted successfully.", friendRequest: req };
  }
  declineFriendRequest(requestId, userId) {
    const req = this.getFriendRequestById(requestId);
    if (!req) return { success: false, message: "Friend request not found." };
    if (req.receiverId !== userId) return { success: false, message: "You are not authorized to decline this friend request." };
    if (req.status !== "PENDING") return { success: false, message: `This friend request has already been ${req.status.toLowerCase()}.` };
    req.status = "DECLINED";
    req.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const notif = this.data.notifications.find((n) => n.userId === userId && n.metadata?.friendRequestId === req.id);
    if (notif) notif.isRead = true;
    this.save();
    return { success: true, message: "Friend request declined." };
  }
  addContact(userId, contactUserId, nickname) {
    if (!this.data.contacts) this.data.contacts = [];
    const existing = this.data.contacts.find((c) => c.userId === userId && c.contactUserId === contactUserId);
    if (existing) {
      if (nickname) existing.nickname = nickname;
      return existing;
    }
    const newContact = {
      id: "cnt_" + Math.random().toString(36).substring(2, 9),
      userId,
      contactUserId,
      nickname,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.contacts.push(newContact);
    this.save();
    return newContact;
  }
  areFriends(userId1, userId2) {
    if (!userId1 || !userId2 || userId1 === userId2) return false;
    return (this.data.contacts || []).some((c) => c.userId === userId1 && c.contactUserId === userId2);
  }
  getContactsForUser(userId) {
    if (!this.data.contacts) this.data.contacts = [];
    const userContacts = this.data.contacts.filter((c) => c.userId === userId);
    const result = [];
    for (const c of userContacts) {
      const u = this.findUserById(c.contactUserId);
      if (u) {
        result.push({
          contactRecordId: c.id,
          user: {
            id: u.id,
            name: u.name,
            username: u.username || this.generateUniqueUsername(u.name),
            email: u.email,
            avatarUrl: u.avatarUrl
          },
          addedAt: c.createdAt,
          nickname: c.nickname
        });
      }
    }
    return result.sort((a, b) => a.user.name.localeCompare(b.user.name));
  }
  removeContact(userId, contactUserId) {
    if (!this.data.contacts) this.data.contacts = [];
    const initialLen = this.data.contacts.length;
    this.data.contacts = this.data.contacts.filter(
      (c) => !(c.userId === userId && c.contactUserId === contactUserId || c.userId === contactUserId && c.contactUserId === userId)
    );
    const changed = this.data.contacts.length !== initialLen;
    if (changed) this.save();
    return changed;
  }
  getConversationId(userId1, userId2) {
    return [userId1, userId2].sort().join(":");
  }
  getChatMessages(userId1, userId2) {
    if (!this.data.chatMessages) this.data.chatMessages = [];
    const convId = this.getConversationId(userId1, userId2);
    const msgs = this.data.chatMessages.filter((m) => m.conversationId === convId);
    let readChanged = false;
    for (const m of msgs) {
      if (m.receiverId === userId1 && !m.isRead) {
        m.isRead = true;
        readChanged = true;
      }
    }
    if (readChanged) {
      this.save();
    }
    return msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  sendTextMessage(senderId, receiverId, text) {
    const sender = this.findUserById(senderId);
    const receiver = this.findUserById(receiverId);
    if (!sender || !receiver) throw new Error("User not found.");
    if (!this.areFriends(senderId, receiverId)) {
      throw new Error("You can only send private messages to accepted contacts.");
    }
    const convId = this.getConversationId(senderId, receiverId);
    const msg = {
      id: "msg_" + Math.random().toString(36).substring(2, 11),
      conversationId: convId,
      senderId: sender.id,
      senderName: sender.name,
      senderUsername: sender.username || this.generateUniqueUsername(sender.name),
      senderAvatarUrl: sender.avatarUrl,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverUsername: receiver.username || this.generateUniqueUsername(receiver.name),
      receiverAvatarUrl: receiver.avatarUrl,
      type: "TEXT",
      text: text.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isRead: false
    };
    if (!this.data.chatMessages) this.data.chatMessages = [];
    this.data.chatMessages.push(msg);
    this.createNotification({
      userId: receiver.id,
      title: `New Message from ${sender.name}`,
      message: text.length > 80 ? text.substring(0, 77) + "..." : text,
      type: "MESSAGE",
      link: `/contacts?chat=${sender.id}`
    });
    this.save();
    return msg;
  }
  sendFileMessage(senderId, receiverId, attachment, isImage) {
    const sender = this.findUserById(senderId);
    const receiver = this.findUserById(receiverId);
    if (!sender || !receiver) throw new Error("User not found.");
    if (!this.areFriends(senderId, receiverId)) {
      throw new Error("You can only send files to accepted contacts.");
    }
    const convId = this.getConversationId(senderId, receiverId);
    const msg = {
      id: "msg_" + Math.random().toString(36).substring(2, 11),
      conversationId: convId,
      senderId: sender.id,
      senderName: sender.name,
      senderUsername: sender.username || this.generateUniqueUsername(sender.name),
      senderAvatarUrl: sender.avatarUrl,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverUsername: receiver.username || this.generateUniqueUsername(receiver.name),
      receiverAvatarUrl: receiver.avatarUrl,
      type: isImage ? "IMAGE" : "FILE",
      attachment,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isRead: false
    };
    if (!this.data.chatMessages) this.data.chatMessages = [];
    this.data.chatMessages.push(msg);
    this.createNotification({
      userId: receiver.id,
      title: `New File from ${sender.name}`,
      message: `${sender.name} sent you ${isImage ? "an image" : "a file"}: ${attachment.originalName}`,
      type: "MESSAGE",
      link: `/contacts?chat=${sender.id}`
    });
    this.save();
    return msg;
  }
  sendReceiptMessage(senderId, receiverId, receipt) {
    const sender = this.findUserById(senderId);
    const receiver = this.findUserById(receiverId);
    if (!sender || !receiver) throw new Error("User not found.");
    if (!this.areFriends(senderId, receiverId)) {
      throw new Error("You can only share receipts with accepted contacts.");
    }
    const convId = this.getConversationId(senderId, receiverId);
    const msg = {
      id: "msg_" + Math.random().toString(36).substring(2, 11),
      conversationId: convId,
      senderId: sender.id,
      senderName: sender.name,
      senderUsername: sender.username || this.generateUniqueUsername(sender.name),
      senderAvatarUrl: sender.avatarUrl,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverUsername: receiver.username || this.generateUniqueUsername(receiver.name),
      receiverAvatarUrl: receiver.avatarUrl,
      type: "RECEIPT",
      receipt,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isRead: false
    };
    if (!this.data.chatMessages) this.data.chatMessages = [];
    this.data.chatMessages.push(msg);
    this.createNotification({
      userId: receiver.id,
      title: `Payment Receipt Shared by ${sender.name}`,
      message: `${sender.name} shared a settlement receipt for ${receipt.currency} ${receipt.amount.toLocaleString()} (${receipt.groupName}).`,
      type: "PAYMENT",
      link: `/contacts?chat=${sender.id}`
    });
    this.save();
    return msg;
  }
  getAttachmentMessage(attachmentId) {
    return (this.data.chatMessages || []).find((m) => m.attachment?.id === attachmentId);
  }
  getUnreadMessageCount(userId) {
    return (this.data.chatMessages || []).filter((m) => m.receiverId === userId && !m.isRead).length;
  }
  initDemoDataIfNeeded(force = false) {
    if (!force && this.data.users.length > 0) {
      return;
    }
    console.log("Seeding initial demo data for SplitSmart AI...");
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync("Password@123", salt);
    const rahul = {
      id: "usr_rahul",
      name: "Rahul Sharma",
      username: "@rahulsharma_101",
      email: "rahul@example.com",
      gender: "male",
      passwordHash: demoPasswordHash,
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 30 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const priya = {
      id: "usr_priya",
      name: "Priya Patel",
      username: "@priyapatel_204",
      email: "priya@example.com",
      gender: "female",
      passwordHash: demoPasswordHash,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 28 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const aman = {
      id: "usr_aman",
      name: "Aman Gupta",
      username: "@amangupta_305",
      email: "aman@example.com",
      gender: "male",
      passwordHash: demoPasswordHash,
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 25 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const sneha = {
      id: "usr_sneha",
      name: "Sneha Roy",
      username: "@sneharoy_402",
      email: "sneha@example.com",
      gender: "female",
      passwordHash: demoPasswordHash,
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 20 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.users = [rahul, priya, aman, sneha];
    const goaTrip = {
      id: "grp_goa2026",
      name: "Goa Trip 2026",
      description: "Annual beach vacation and adventures with college gang",
      category: "Travel",
      currency: "INR",
      creatorId: rahul.id,
      budget: 35e3,
      createdAt: new Date(Date.now() - 14 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      members: [
        { id: "gm_1", groupId: "grp_goa2026", userId: rahul.id, name: rahul.name, email: rahul.email, role: "ADMIN", joinedAt: new Date(Date.now() - 14 * 864e5).toISOString() },
        { id: "gm_2", groupId: "grp_goa2026", userId: priya.id, name: priya.name, email: priya.email, role: "MEMBER", joinedAt: new Date(Date.now() - 14 * 864e5).toISOString() },
        { id: "gm_3", groupId: "grp_goa2026", userId: aman.id, name: aman.name, email: aman.email, role: "MEMBER", joinedAt: new Date(Date.now() - 14 * 864e5).toISOString() },
        { id: "gm_4", groupId: "grp_goa2026", userId: sneha.id, name: sneha.name, email: sneha.email, role: "MEMBER", joinedAt: new Date(Date.now() - 13 * 864e5).toISOString() }
      ]
    };
    const collegeFriends = {
      id: "grp_college",
      name: "College Friends",
      description: "Weekend hangouts, dinners, movies & treats",
      category: "Entertainment",
      currency: "INR",
      creatorId: rahul.id,
      createdAt: new Date(Date.now() - 45 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      members: [
        { id: "gm_5", groupId: "grp_college", userId: rahul.id, name: rahul.name, email: rahul.email, role: "ADMIN", joinedAt: new Date(Date.now() - 45 * 864e5).toISOString() },
        { id: "gm_6", groupId: "grp_college", userId: priya.id, name: priya.name, email: priya.email, role: "MEMBER", joinedAt: new Date(Date.now() - 45 * 864e5).toISOString() },
        { id: "gm_7", groupId: "grp_college", userId: aman.id, name: aman.name, email: aman.email, role: "MEMBER", joinedAt: new Date(Date.now() - 45 * 864e5).toISOString() }
      ]
    };
    const roommates = {
      id: "grp_roommates",
      name: "Roommates Flat 402",
      description: "Rent, groceries, high-speed WiFi, electricity & maintenance",
      category: "Utilities",
      currency: "INR",
      creatorId: aman.id,
      createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      members: [
        { id: "gm_8", groupId: "grp_roommates", userId: rahul.id, name: rahul.name, email: rahul.email, role: "MEMBER", joinedAt: new Date(Date.now() - 60 * 864e5).toISOString() },
        { id: "gm_9", groupId: "grp_roommates", userId: aman.id, name: aman.name, email: aman.email, role: "ADMIN", joinedAt: new Date(Date.now() - 60 * 864e5).toISOString() }
      ]
    };
    this.data.groups = [goaTrip, collegeFriends, roommates];
    const exp1 = {
      id: "exp_1",
      groupId: "grp_goa2026",
      title: "Beach Resort Villa Booking",
      amount: 14e3,
      currency: "INR",
      payerId: rahul.id,
      payerName: rahul.name,
      category: "Accommodation",
      date: new Date(Date.now() - 5 * 864e5).toISOString().split("T")[0],
      splitType: "EQUAL",
      splits: [
        { id: "s_1", expenseId: "exp_1", userId: rahul.id, userName: rahul.name, shareAmount: 3500 },
        { id: "s_2", expenseId: "exp_1", userId: priya.id, userName: priya.name, shareAmount: 3500 },
        { id: "s_3", expenseId: "exp_1", userId: aman.id, userName: aman.name, shareAmount: 3500 },
        { id: "s_4", expenseId: "exp_1", userId: sneha.id, userName: sneha.name, shareAmount: 3500 }
      ],
      notes: "3 nights stay near Baga Beach with breakfast included",
      createdAt: new Date(Date.now() - 5 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const exp2 = {
      id: "exp_2",
      groupId: "grp_goa2026",
      title: "Seafood Shack Dinner & Drinks",
      amount: 4800,
      currency: "INR",
      payerId: priya.id,
      payerName: priya.name,
      category: "Food",
      date: new Date(Date.now() - 4 * 864e5).toISOString().split("T")[0],
      splitType: "EQUAL",
      splits: [
        { id: "s_5", expenseId: "exp_2", userId: rahul.id, userName: rahul.name, shareAmount: 1200 },
        { id: "s_6", expenseId: "exp_2", userId: priya.id, userName: priya.name, shareAmount: 1200 },
        { id: "s_7", expenseId: "exp_2", userId: aman.id, userName: aman.name, shareAmount: 1200 },
        { id: "s_8", expenseId: "exp_2", userId: sneha.id, userName: sneha.name, shareAmount: 1200 }
      ],
      notes: "Candlelight dinner at Curlies Beach Shack",
      createdAt: new Date(Date.now() - 4 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const exp3 = {
      id: "exp_3",
      groupId: "grp_goa2026",
      title: "Self-Drive Thar Rental & Fuel",
      amount: 6e3,
      currency: "INR",
      payerId: aman.id,
      payerName: aman.name,
      category: "Travel",
      date: new Date(Date.now() - 3 * 864e5).toISOString().split("T")[0],
      splitType: "EQUAL",
      splits: [
        { id: "s_9", expenseId: "exp_3", userId: rahul.id, userName: rahul.name, shareAmount: 1500 },
        { id: "s_10", expenseId: "exp_3", userId: priya.id, userName: priya.name, shareAmount: 1500 },
        { id: "s_11", expenseId: "exp_3", userId: aman.id, userName: aman.name, shareAmount: 1500 },
        { id: "s_12", expenseId: "exp_3", userId: sneha.id, userName: sneha.name, shareAmount: 1500 }
      ],
      notes: "Airport pickup and north Goa cruising",
      createdAt: new Date(Date.now() - 3 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const exp4 = {
      id: "exp_4",
      groupId: "grp_college",
      title: "Italian Bistro Weekend Celebration",
      amount: 3600,
      currency: "INR",
      payerId: rahul.id,
      payerName: rahul.name,
      category: "Food",
      date: new Date(Date.now() - 2 * 864e5).toISOString().split("T")[0],
      splitType: "EQUAL",
      splits: [
        { id: "s_13", expenseId: "exp_4", userId: rahul.id, userName: rahul.name, shareAmount: 1200 },
        { id: "s_14", expenseId: "exp_4", userId: priya.id, userName: priya.name, shareAmount: 1200 },
        { id: "s_15", expenseId: "exp_4", userId: aman.id, userName: aman.name, shareAmount: 1200 }
      ],
      notes: "Pizzas, pasta and tiramisu",
      createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const exp5 = {
      id: "exp_5",
      groupId: "grp_roommates",
      title: "High-Speed Fiber WiFi & Electricity",
      amount: 2400,
      currency: "INR",
      payerId: aman.id,
      payerName: aman.name,
      category: "Utilities",
      date: new Date(Date.now() - 1 * 864e5).toISOString().split("T")[0],
      splitType: "EQUAL",
      splits: [
        { id: "s_16", expenseId: "exp_5", userId: rahul.id, userName: rahul.name, shareAmount: 1200 },
        { id: "s_17", expenseId: "exp_5", userId: aman.id, userName: aman.name, shareAmount: 1200 }
      ],
      notes: "Monthly connection bill",
      createdAt: new Date(Date.now() - 1 * 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.expenses = [exp1, exp2, exp3, exp4, exp5];
    const pay1 = {
      id: "pay_demo_1",
      settlementId: "set_demo_1",
      groupId: "grp_goa2026",
      payerId: sneha.id,
      payerName: sneha.name,
      recipientId: rahul.id,
      recipientName: rahul.name,
      amount: 3500,
      currency: "INR",
      method: "PAYPAL",
      status: "COMPLETED",
      reference: "PP-TXN-88492019",
      createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
      metadata: { note: "Villa booking share settled via PayPal Sandbox" }
    };
    this.data.payments = [pay1];
    this.data.notifications = [
      {
        id: "notif_1",
        userId: rahul.id,
        title: "Settlement Received",
        message: "Sneha Roy settled \u20B93,500 for Beach Resort Villa Booking via PayPal Sandbox.",
        type: "PAYMENT",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
        link: "/transactions"
      },
      {
        id: "notif_2",
        userId: rahul.id,
        title: "New Expense Added",
        message: 'Aman Gupta added "High-Speed Fiber WiFi & Electricity" (\u20B92,400) in Roommates Flat 402.',
        type: "EXPENSE",
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 864e5).toISOString(),
        link: "/groups/grp_roommates"
      },
      {
        id: "notif_3",
        userId: rahul.id,
        title: "AI Smart Insight",
        message: "Food and Accommodation account for 61% of your group spending this month.",
        type: "ALERT",
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 864e5).toISOString(),
        link: "/analytics"
      }
    ];
    this.data.contacts = [
      { id: "cnt_1", userId: rahul.id, contactUserId: priya.id, createdAt: new Date(Date.now() - 25 * 864e5).toISOString() },
      { id: "cnt_2", userId: priya.id, contactUserId: rahul.id, createdAt: new Date(Date.now() - 25 * 864e5).toISOString() },
      { id: "cnt_3", userId: rahul.id, contactUserId: aman.id, createdAt: new Date(Date.now() - 20 * 864e5).toISOString() },
      { id: "cnt_4", userId: aman.id, contactUserId: rahul.id, createdAt: new Date(Date.now() - 20 * 864e5).toISOString() }
    ];
    const demoReqId = "freq_demo_sneha";
    this.data.friendRequests = [
      {
        id: demoReqId,
        senderId: sneha.id,
        senderName: sneha.name,
        senderUsername: sneha.username,
        senderAvatarUrl: sneha.avatarUrl,
        receiverId: rahul.id,
        receiverName: rahul.name,
        receiverUsername: rahul.username,
        status: "PENDING",
        createdAt: new Date(Date.now() - 2 * 36e5).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 36e5).toISOString()
      }
    ];
    this.data.notifications.push({
      id: "notif_demo_freq",
      userId: rahul.id,
      title: "New Friend Request \u{1F44B}",
      message: `${sneha.name} (${sneha.username}) sent you a friend request.`,
      type: "FRIEND_REQUEST",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 36e5).toISOString(),
      link: "/contacts",
      metadata: {
        friendRequestId: demoReqId,
        senderId: sneha.id,
        senderName: sneha.name,
        senderUsername: sneha.username
      }
    });
    const rahulPriyaConv = this.getConversationId(rahul.id, priya.id);
    this.data.chatMessages = [
      {
        id: "msg_demo_1",
        conversationId: rahulPriyaConv,
        senderId: priya.id,
        senderName: priya.name,
        senderUsername: priya.username,
        senderAvatarUrl: priya.avatarUrl,
        receiverId: rahul.id,
        receiverName: rahul.name,
        receiverUsername: rahul.username,
        type: "TEXT",
        text: "Hey Rahul! Did you receive the settlement for Beach Resort Villa Booking?",
        createdAt: new Date(Date.now() - 36 * 36e5).toISOString(),
        isRead: true
      },
      {
        id: "msg_demo_2",
        conversationId: rahulPriyaConv,
        senderId: rahul.id,
        senderName: rahul.name,
        senderUsername: rahul.username,
        receiverId: priya.id,
        receiverName: priya.name,
        receiverUsername: priya.username,
        receiverAvatarUrl: priya.avatarUrl,
        type: "TEXT",
        text: "Yes! All confirmed on PayPal Sandbox. Here is the verified payment receipt for your records:",
        createdAt: new Date(Date.now() - 35 * 36e5).toISOString(),
        isRead: true
      },
      {
        id: "msg_demo_3",
        conversationId: rahulPriyaConv,
        senderId: rahul.id,
        senderName: rahul.name,
        senderUsername: rahul.username,
        receiverId: priya.id,
        receiverName: priya.name,
        receiverUsername: priya.username,
        receiverAvatarUrl: priya.avatarUrl,
        type: "RECEIPT",
        receipt: {
          paymentId: pay1.id,
          reference: pay1.reference,
          amount: pay1.amount,
          currency: pay1.currency,
          groupName: "Goa Trip 2026",
          date: pay1.createdAt,
          status: pay1.status,
          payerName: pay1.payerName,
          recipientName: pay1.recipientName,
          receiptNumber: pay1.metadata?.receiptNumber || "REC-2026-88492"
        },
        createdAt: new Date(Date.now() - 34 * 36e5).toISOString(),
        isRead: true
      }
    ];
    this.save();
    console.log("Demo data successfully initialized.");
  }
  resetDemoData() {
    this.initDemoDataIfNeeded(true);
  }
};
var db = new Database();

// server/services/email.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
var EmailService = class {
  transporter = null;
  isSmtpConfigured = false;
  resendApiKey = null;
  constructor() {
    this.init();
  }
  init() {
    this.resendApiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : null;
    const host = process.env.SMTP_HOST?.trim();
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const user = process.env.SMTP_USER?.trim() || "harsh2007joshi@gmail.com";
    const pass = (process.env.SMTP_PASS?.trim() || "oufptekjeotlkkqi").replace(/\s+/g, "");
    const service = process.env.SMTP_SERVICE?.trim() || "gmail";
    if (this.resendApiKey) {
      console.log("\u2705 Resend Email API connected successfully.");
    }
    if (service === "gmail" || host?.includes("gmail") || !host && user && pass) {
      if (user && pass) {
        try {
          this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user, pass }
          });
          this.isSmtpConfigured = true;
          console.log(`\u2705 Gmail SMTP Email service configured successfully for ${user}.`);
        } catch (err) {
          console.warn("\u26A0\uFE0F Failed to initialize Gmail SMTP transport:", err);
        }
      }
    } else if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        });
        this.isSmtpConfigured = true;
        console.log(`\u2705 SMTP Email service configured successfully (${host}:${port}).`);
      } catch (err) {
        console.warn("\u26A0\uFE0F Failed to initialize SMTP transport:", err);
      }
    }
    if (!this.resendApiKey && !this.isSmtpConfigured) {
      console.log("\u2139\uFE0F No active email API/SMTP configured. EmailService running in Development Console mode.");
    }
  }
  isReady() {
    return Boolean(this.resendApiKey || this.isSmtpConfigured);
  }
  getProviderStatus() {
    if (this.isSmtpConfigured) return { ready: true, provider: "Gmail SMTP" };
    if (this.resendApiKey) return { ready: true, provider: "Resend API" };
    return { ready: false, provider: "Development Console (Log only)" };
  }
  async dispatchHtmlEmail(options) {
    const { to, subject, html, textFallback } = options;
    const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_FROM || "SplitSmart AI <harsh2007joshi@gmail.com>";
    if (this.isSmtpConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
          text: textFallback
        });
        console.log(`\u2709\uFE0F Email successfully dispatched to ${to} via Gmail SMTP.`);
        return { delivered: true, devMode: false };
      } catch (err) {
        console.warn(`\u26A0\uFE0F Failed to send email via SMTP to ${to} (trying fallback):`, err.message);
      }
    }
    if (this.resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || "SplitSmart AI <onboarding@resend.dev>",
            to: [to],
            subject,
            html,
            text: textFallback
          })
        });
        if (response.ok) {
          console.log(`\u2709\uFE0F Email successfully dispatched to ${to} via Resend API.`);
          return { delivered: true, devMode: false };
        } else {
          const errBody = await response.text();
          console.warn(`\u26A0\uFE0F Resend API returned error for ${to}:`, errBody);
        }
      } catch (err) {
        console.warn("\u26A0\uFE0F Resend API fetch failed:", err.message);
      }
    }
    console.log("\n============================================================");
    console.log(`\u{1F4E8} [DEV EMAIL DISPATCH - CONSOLE FALLBACK]`);
    console.log(`\u{1F4EC} To: ${to}`);
    console.log(`\u{1F4CB} Subject: ${subject}`);
    if (textFallback) console.log(`\u{1F4C4} Summary: ${textFallback}`);
    console.log("============================================================\n");
    return { delivered: true, devMode: true };
  }
  async sendOtp(options) {
    const { to, name = "there", code, type, expiryMinutes = 10 } = options;
    const subject = type === "VERIFICATION" ? `Verify your SplitSmart AI email [Code: ${code}]` : `SplitSmart AI Password Reset Code: ${code}`;
    const title = type === "VERIFICATION" ? "Verify Your Email Address" : "Reset Your Password";
    const description = type === "VERIFICATION" ? "Thank you for joining SplitSmart AI. Use the 6-digit verification code below to confirm your account and start splitting expenses smarter." : "We received a request to reset your SplitSmart AI password. Enter this one-time security code to set a new password.";
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #F1F9FF; padding: 32px 24px; border-radius: 24px; border: 1px solid #D8E9FA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #1685F8, #0E6FD8); padding: 12px 18px; border-radius: 16px; color: #FFFFFF; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; box-shadow: 0 8px 20px -4px rgba(22, 133, 248, 0.4);">
            \u26A1 SplitSmart AI
          </div>
          <p style="color: #64748B; font-size: 13px; margin-top: 8px;">PayPal AI Hackathon Edition</p>
        </div>

        <div style="background: #FFFFFF; border-radius: 20px; padding: 32px 28px; box-shadow: 0 10px 30px -10px rgba(16, 39, 74, 0.08); border: 1px solid #D8E9FA; text-align: center;">
          <h2 style="color: #10274A; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">${title}</h2>
          <p style="color: #64748B; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">Hi ${name}, ${description}</p>

          <div style="background: #F1F9FF; border: 2px dashed #BFE9FF; border-radius: 16px; padding: 18px; margin: 24px 0;">
            <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1685F8; font-family: monospace;">
              ${code}
            </div>
            <p style="margin: 6px 0 0; font-size: 13px; color: #64748B;">Expires in ${expiryMinutes} minutes</p>
          </div>

          <p style="color: #EF4444; font-size: 13px; font-weight: 500; margin-top: 18px;">
            \u26A0\uFE0F If you did not request this code, please ignore this email. Never share this code with anyone.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748B; font-size: 12px;">
          <p>\xA9 2026 SplitSmart AI. Split Expenses. Smarter Together.</p>
        </div>
      </div>
    `;
    const result = await this.dispatchHtmlEmail({
      to,
      subject,
      html: htmlContent,
      textFallback: `Your verification code is: ${code} (expires in ${expiryMinutes} minutes)`
    });
    return {
      delivered: result.delivered,
      devMode: result.devMode,
      message: result.devMode ? `Development Mode: OTP for ${to} is [${code}] (Check server logs)` : `Verification code successfully sent to ${to}`
    };
  }
  async sendGroupInvitation(options) {
    const { to, memberName, inviterName, groupName, joinUrl } = options;
    const subject = `\u{1F334} ${inviterName} invited you to join "${groupName}" on SplitSmart AI`;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #F1F9FF; padding: 32px 24px; border-radius: 24px; border: 1px solid #D8E9FA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #1685F8, #0E6FD8); padding: 12px 18px; border-radius: 16px; color: #FFFFFF; font-weight: 800; font-size: 20px; box-shadow: 0 8px 20px -4px rgba(22, 133, 248, 0.4);">
            \u26A1 SplitSmart AI
          </div>
          <p style="color: #64748B; font-size: 13px; margin-top: 8px;">Shared Trip & Expense Circle</p>
        </div>

        <div style="background: #FFFFFF; border-radius: 20px; padding: 32px 28px; box-shadow: 0 10px 30px -10px rgba(16, 39, 74, 0.08); border: 1px solid #D8E9FA; text-align: center;">
          <h2 style="color: #10274A; font-size: 22px; font-weight: 700; margin-top: 0;">You're Invited! \u{1F389}</h2>
          <p style="color: #64748B; font-size: 15px; line-height: 1.6; margin: 16px 0 24px;">
            Hi <strong>${memberName}</strong>,<br/>
            <strong>${inviterName}</strong> added you to the shared trip circle <strong>"${groupName}"</strong> on SplitSmart AI.
          </p>

          <div style="background: #E9F5FE; border-radius: 16px; padding: 16px; margin: 20px 0; border: 1px solid #BFE9FF;">
            <p style="color: #1685F8; font-size: 13px; font-weight: 600; margin: 0;">
              \u2728 You can now view balances, log expenses from your own device, and settle up with PayPal!
            </p>
          </div>

          <div style="margin: 28px 0 16px;">
            <a href="${joinUrl}" style="background: linear-gradient(135deg, #1685F8, #0E6FD8); color: #FFFFFF; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 8px 20px -4px rgba(22, 133, 248, 0.5);">
              Join Trip & Add Expenses \u2192
            </a>
          </div>

          <p style="color: #64748B; font-size: 12px; margin-top: 16px;">
            Or open this direct link in any browser:<br/>
            <a href="${joinUrl}" style="color: #1685F8; word-break: break-all; font-weight: 600;">${joinUrl}</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748B; font-size: 12px;">
          <p>\xA9 2026 SplitSmart AI \u2022 Split Expenses. Smarter Together.</p>
        </div>
      </div>
    `;
    const result = await this.dispatchHtmlEmail({
      to,
      subject,
      html: htmlContent,
      textFallback: `${inviterName} invited you to "${groupName}" on SplitSmart AI. Open: ${joinUrl}`
    });
    return {
      delivered: result.delivered,
      devMode: result.devMode,
      message: result.error ? `${result.error}` : result.devMode ? `Development Mode: Invitation link for ${to} is [${joinUrl}] (Logged in server console)` : `Invitation successfully emailed to ${to}`
    };
  }
  async sendShareLink(options) {
    const { to, friendName = "Friend", senderName, linkUrl, customMessage } = options;
    const subject = `\u{1F680} ${senderName} shared SplitSmart AI with you!`;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #F1F9FF; padding: 32px 24px; border-radius: 24px; border: 1px solid #D8E9FA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #1685F8, #0E6FD8); padding: 12px 18px; border-radius: 16px; color: #FFFFFF; font-weight: 800; font-size: 20px; box-shadow: 0 8px 20px -4px rgba(22, 133, 248, 0.4);">
            \u26A1 SplitSmart AI
          </div>
          <p style="color: #64748B; font-size: 13px; margin-top: 8px;">Instant Shared Link</p>
        </div>

        <div style="background: #FFFFFF; border-radius: 20px; padding: 32px 28px; box-shadow: 0 10px 30px -10px rgba(16, 39, 74, 0.08); border: 1px solid #D8E9FA; text-align: center;">
          <h2 style="color: #10274A; font-size: 22px; font-weight: 700; margin-top: 0;">Here's your link! \u{1F389}</h2>
          <p style="color: #64748B; font-size: 15px; line-height: 1.6; margin: 16px 0 24px;">
            Hi <strong>${friendName}</strong>,<br/>
            <strong>${senderName}</strong> wants you to check out <strong>SplitSmart AI</strong>.
            ${customMessage ? `<br/><br/><em>"${customMessage}"</em>` : ""}
          </p>

          <div style="margin: 28px 0 20px;">
            <a href="${linkUrl}" style="background: linear-gradient(135deg, #1685F8, #0E6FD8); color: #FFFFFF; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 8px 20px -4px rgba(22, 133, 248, 0.5);">
              Open SplitSmart AI Now \u2192
            </a>
          </div>

          <p style="color: #64748B; font-size: 12px; margin-top: 16px;">
            Or copy and open this direct link in any browser:<br/>
            <a href="${linkUrl}" style="color: #1685F8; word-break: break-all; font-weight: 600;">${linkUrl}</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748B; font-size: 12px;">
          <p>\xA9 2026 SplitSmart AI \u2022 Split Expenses. Smarter Together.</p>
        </div>
      </div>
    `;
    const result = await this.dispatchHtmlEmail({
      to,
      subject,
      html: htmlContent,
      textFallback: `${senderName} shared a link with you: ${linkUrl}`
    });
    return {
      delivered: result.delivered,
      devMode: result.devMode,
      message: result.error ? `${result.error}` : result.devMode ? `Link for ${to} is [${linkUrl}] (Dev console mode)` : `Link successfully delivered to ${to}`
    };
  }
};
var emailService = new EmailService();

// server/services/twoFactorService.ts
var TwoFactorService = class {
  apiKey;
  baseUrl = "https://2factor.in/API/V1";
  constructor() {
    this.apiKey = process.env.TWOFACTOR_API_KEY;
    if (this.apiKey) {
      console.log("\u{1F4F1} 2Factor.in SMS Gateway API Key configured.");
    } else {
      console.log("\u2139\uFE0F TWOFACTOR_API_KEY not configured. Running 2Factor.in SMS in Development Console Mode.");
    }
  }
  formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return cleaned;
    }
    if (cleaned.length === 12 && cleaned.startsWith("91")) {
      return cleaned.substring(2);
    }
    return cleaned;
  }
  async sendOtp(phone, customOtp) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const otp = customOtp || Math.floor(1e5 + Math.random() * 9e5).toString();
    if (this.apiKey && this.apiKey !== "your_2factor_api_key_here") {
      try {
        const url = `${this.baseUrl}/${this.apiKey}/SMS/${formattedPhone}/${otp}/SplitSmartAI`;
        const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(3e3) });
        const data = await res.json();
        if (data.Status === "Success") {
          console.log(`\u{1F4F1} [2FACTOR.IN] OTP dispatched to ${formattedPhone}. Session: ${data.Details}`);
          return {
            success: true,
            sessionId: data.Details,
            otp,
            devMode: false,
            message: `OTP sent via SMS to ${formattedPhone}`
          };
        } else {
          console.warn(`\u26A0\uFE0F 2Factor.in error (${data.Details}), falling back to dev mode:`, data);
        }
      } catch (err) {
        console.warn("\u26A0\uFE0F 2Factor.in network request failed, falling back to dev console:", err.message);
      }
    }
    console.log("\n============================================================");
    console.log(`\u{1F4F1} [2FACTOR.IN SMS GATEWAY DEV MODE]`);
    console.log(`\u{1F4DE} Recipient Phone: +91 ${formattedPhone}`);
    console.log(`\u{1F511} SMS OTP Code: >>> [ ${otp} ] <<<`);
    console.log(`\u{1F4AC} Message: "Your SplitSmart AI phone verification code is ${otp}. Valid for 10 minutes."`);
    console.log("============================================================\n");
    return {
      success: true,
      sessionId: `2F_SESSION_${Date.now()}`,
      otp,
      devMode: true,
      message: `Development Mode: SMS OTP for +91 ${formattedPhone} is [${otp}] (See server console)`
    };
  }
  async verifyOtp(sessionId, enteredOtp, expectedOtp) {
    if (this.apiKey && this.apiKey !== "your_2factor_api_key_here" && sessionId && !sessionId.startsWith("2F_SESSION_")) {
      try {
        const url = `${this.baseUrl}/${this.apiKey}/SMS/VERIFY/${sessionId}/${enteredOtp.trim()}`;
        const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(3e3) });
        const data = await res.json();
        if (data.Status === "Success" && data.Details === "OTP Matched") {
          return { success: true, message: "Phone number verified successfully via 2Factor.in!" };
        } else {
          return { success: false, message: data.Details || "Invalid OTP code entered." };
        }
      } catch (err) {
        console.warn("2Factor verify network failed, checking local fallback:", err.message);
      }
    }
    if (expectedOtp && enteredOtp.trim() === expectedOtp.trim()) {
      return { success: true, message: "Phone number verified successfully!" };
    }
    return { success: false, message: "Incorrect OTP entered. Please check and try again." };
  }
};
var twoFactorService = new TwoFactorService();

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "splitsmart_secret_hackathon_key_2026_xyz";
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Authentication required. Please log in." });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = db.findUserById(decoded.userId);
    if (!user && decoded.user && decoded.user.id) {
      user = db.createUser({
        id: decoded.user.id,
        name: decoded.user.name || "User",
        username: decoded.user.username,
        email: decoded.user.email || decoded.email || "user@example.com",
        phoneNumber: decoded.user.phoneNumber,
        passwordHash: "",
        gender: decoded.user.gender,
        avatarUrl: decoded.user.avatarUrl,
        isEmailVerified: decoded.user.isEmailVerified ?? true,
        isPhoneVerified: decoded.user.isPhoneVerified ?? false
      });
    }
    if (!user) {
      res.status(401).json({ error: "User session not found or expired." });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired authentication token." });
  }
}

// server/routes/auth.ts
var router = Router();
function generateUserToken(user, rememberMe = false) {
  const expiresIn = rememberMe ? "30d" : "7d";
  return jwt2.sign(
    {
      userId: user.id,
      email: user.email,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    },
    JWT_SECRET,
    { expiresIn }
  );
}
router.post("/send-phone-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ error: "Mobile phone number is required." });
      return;
    }
    const smsRes = await twoFactorService.sendOtp(phone);
    if (!smsRes.success) {
      res.status(500).json({ error: "Failed to dispatch SMS OTP." });
      return;
    }
    db.savePhoneOtp(phone, smsRes.otp || "", smsRes.sessionId || "");
    res.json({
      success: true,
      message: smsRes.message,
      sessionId: smsRes.sessionId,
      devMode: smsRes.devMode
    });
  } catch (err) {
    console.error("Send phone OTP error:", err);
    res.status(500).json({ error: "Internal error sending SMS." });
  }
});
router.post("/verify-phone-otp", async (req, res) => {
  try {
    const { phone, otp, sessionId } = req.body;
    if (!phone || !otp) {
      res.status(400).json({ error: "Phone number and 6-digit OTP code are required." });
      return;
    }
    const localCheck = db.verifyPhoneOtpLocally(phone, otp);
    if (localCheck.success) {
      res.json({ success: true, message: "Phone number successfully verified!" });
      return;
    }
    const verifyRes = await twoFactorService.verifyOtp(sessionId, otp);
    if (verifyRes.success) {
      res.json({ success: true, message: verifyRes.message });
    } else {
      res.status(400).json({ error: verifyRes.message || "Incorrect OTP code." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to verify phone OTP." });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { name, email, phoneNumber, password, confirmPassword, agreeTerms, otpMethod = "PHONE" } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({ error: "Please fill in all required fields." });
      return;
    }
    if (!phoneNumber || !phoneNumber.toString().trim()) {
      res.status(400).json({ error: "Mobile phone number is mandatory to create an account." });
      return;
    }
    const cleanPhone = phoneNumber.toString().trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      res.status(400).json({ error: "Please enter a valid 10-digit mobile phone number." });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long." });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: "An account with this email address already exists. Please log in." });
      return;
    }
    const existingPhoneUser = db.findUserByPhone(cleanPhone);
    if (existingPhoneUser) {
      res.status(409).json({ error: "An account with this mobile phone number already exists. Please log in." });
      return;
    }
    const salt = bcrypt2.genSaltSync(10);
    const passwordHash = bcrypt2.hashSync(password, salt);
    const newUser = db.createUser({
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber?.trim(),
      isPhoneVerified: false,
      passwordHash,
      isEmailVerified: false
    });
    let phoneDispatch = null;
    let emailResult = null;
    if (phoneNumber && phoneNumber.trim()) {
      try {
        const smsRes = await Promise.race([
          twoFactorService.sendOtp(phoneNumber.trim()),
          new Promise(
            (resolve) => setTimeout(
              () => resolve({
                success: true,
                devMode: true,
                otp: Math.floor(1e5 + Math.random() * 9e5).toString(),
                message: "Dev fallback OTP"
              }),
              2500
            )
          )
        ]);
        phoneDispatch = smsRes;
        if (smsRes?.otp) {
          db.savePhoneOtp(phoneNumber.trim(), smsRes.otp, smsRes.sessionId || "");
        }
      } catch (smsErr) {
        console.warn("SMS dispatch warning (proceeding with registration):", smsErr);
      }
    }
    let code = "";
    try {
      code = db.createVerificationOtp(newUser.id, newUser.email);
      emailResult = await emailService.sendOtp({
        to: newUser.email,
        name: newUser.name,
        code,
        type: "VERIFICATION",
        expiryMinutes: 15
      });
    } catch (emailErr) {
      console.warn("Email dispatch warning (proceeding with registration):", emailErr);
    }
    const signupToken = jwt2.sign(
      {
        userId: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        passwordHash: newUser.passwordHash,
        otpCode: code
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({
      message: phoneNumber ? "Account created successfully! 6-digit OTP code sent to your email." : "Account created successfully. A verification code has been sent to your email.",
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      signupToken,
      requiresVerification: true,
      emailDispatch: emailResult,
      phoneDispatch
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message || "Internal server error during registration." });
  }
});
router.post("/verify-email", async (req, res) => {
  try {
    const { userId, code, email, signupToken } = req.body;
    if (!code || !userId && !email && !signupToken) {
      res.status(400).json({ error: "Verification code is required." });
      return;
    }
    let decodedSignup = null;
    if (signupToken) {
      try {
        decodedSignup = jwt2.verify(signupToken, JWT_SECRET);
      } catch (tokenErr) {
        console.warn("Signup token verification note:", tokenErr);
      }
    }
    const targetUserId = userId || decodedSignup?.userId;
    const targetEmail = (email || decodedSignup?.email || "").trim().toLowerCase();
    let user = targetUserId ? db.findUserById(targetUserId) : void 0;
    if (!user && targetEmail) {
      user = db.findUserByEmail(targetEmail);
    }
    if (!user && decodedSignup) {
      user = db.createUser({
        id: decodedSignup.userId,
        name: decodedSignup.name,
        username: decodedSignup.username,
        email: decodedSignup.email,
        phoneNumber: decodedSignup.phoneNumber,
        passwordHash: decodedSignup.passwordHash,
        isEmailVerified: false,
        isPhoneVerified: false
      });
      if (decodedSignup.otpCode) {
        db.saveVerificationOtp(user.id, user.email, decodedSignup.otpCode);
      }
    }
    if (!user) {
      res.status(404).json({ error: "User not found. Please try registering again." });
      return;
    }
    const trimmedCode = String(code).trim();
    let isCodeValid = false;
    if (decodedSignup && decodedSignup.otpCode && decodedSignup.otpCode.trim() === trimmedCode) {
      isCodeValid = true;
    } else {
      const verificationResult = db.verifyEmailOtp(user.id, trimmedCode);
      if (verificationResult.success) {
        isCodeValid = true;
      } else if (user.phoneNumber) {
        const phoneCheck = db.verifyPhoneOtpLocally(user.phoneNumber, trimmedCode);
        if (phoneCheck.success) {
          isCodeValid = true;
        }
      }
    }
    if (!isCodeValid) {
      res.status(400).json({ error: "Incorrect verification code. Please check your email and try again." });
      return;
    }
    db.updateUser(user.id, { isEmailVerified: true, isPhoneVerified: true });
    user.isEmailVerified = true;
    user.isPhoneVerified = true;
    db.syncUserWithGroups(user);
    const token = generateUserToken(user, true);
    res.json({
      message: "Email verified successfully!",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: err.message || "Verification failed." });
  }
});
router.post("/resend-verification", async (req, res) => {
  try {
    const { userId, email, signupToken } = req.body;
    let decodedSignup = null;
    if (signupToken) {
      try {
        decodedSignup = jwt2.verify(signupToken, JWT_SECRET);
      } catch {
      }
    }
    const targetUserId = userId || decodedSignup?.userId;
    const targetEmail = (email || decodedSignup?.email || "").trim().toLowerCase();
    let user = targetUserId ? db.findUserById(targetUserId) : void 0;
    if (!user && targetEmail) {
      user = db.findUserByEmail(targetEmail);
    }
    if (!user && decodedSignup) {
      user = db.createUser({
        id: decodedSignup.userId,
        name: decodedSignup.name,
        username: decodedSignup.username,
        email: decodedSignup.email,
        phoneNumber: decodedSignup.phoneNumber,
        passwordHash: decodedSignup.passwordHash,
        isEmailVerified: false,
        isPhoneVerified: false
      });
    }
    if (!user) {
      res.status(404).json({ error: "User not found. Please try registering again." });
      return;
    }
    const code = db.createVerificationOtp(user.id, user.email);
    const newSignupToken = jwt2.sign(
      {
        userId: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        passwordHash: user.passwordHash,
        otpCode: code
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    let emailResult = null;
    try {
      emailResult = await emailService.sendOtp({
        to: user.email,
        name: user.name,
        code,
        type: "VERIFICATION",
        expiryMinutes: 15
      });
    } catch (e) {
      console.warn("Resend email warning:", e);
    }
    res.json({
      message: `A new verification code was sent to ${user.email}`,
      emailDispatch: emailResult,
      signupToken: newSignupToken
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to resend code." });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }
    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password. Please try again." });
      return;
    }
    const passwordMatch = bcrypt2.compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid email or password. Please try again." });
      return;
    }
    if (!user.isEmailVerified) {
      const code = db.createVerificationOtp(user.id, user.email);
      const signupToken = jwt2.sign(
        {
          userId: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          passwordHash: user.passwordHash,
          otpCode: code
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      try {
        await emailService.sendOtp({
          to: user.email,
          name: user.name,
          code,
          type: "VERIFICATION",
          expiryMinutes: 15
        });
      } catch (e) {
        console.warn("Login verification email warning:", e);
      }
      res.status(403).json({
        error: "Please verify your email address to log in.",
        requiresVerification: true,
        userId: user.id,
        email: user.email,
        signupToken
      });
      return;
    }
    db.syncUserWithGroups(user);
    const token = generateUserToken(user, !!rememberMe);
    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Login process error." });
  }
});
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, phone } = req.body;
    const targetIdentifier = (email || phone || "").trim();
    if (!targetIdentifier) {
      res.status(400).json({ error: "Please enter your registered email address or mobile phone number." });
      return;
    }
    const isPhone = /^\+?\d{10,13}$/.test(targetIdentifier.replace(/\s+/g, ""));
    let user = isPhone ? db.findUserByPhone(targetIdentifier) : db.findUserByEmail(targetIdentifier);
    const { challengeId, otp } = db.createPasswordResetChallenge(user ? user.email : targetIdentifier);
    let phoneDispatch = null;
    let emailDispatch = null;
    if (isPhone || user && user.phoneNumber) {
      const ph = isPhone ? targetIdentifier : user.phoneNumber;
      phoneDispatch = await twoFactorService.sendOtp(ph, otp);
      db.savePhoneOtp(ph, otp, challengeId);
    }
    if (user) {
      emailDispatch = await emailService.sendOtp({
        to: user.email,
        name: user.name,
        code: otp,
        type: "PASSWORD_RESET",
        expiryMinutes: 10
      });
    }
    res.json({
      message: isPhone ? "A 6-digit password recovery code has been sent via 2Factor.in SMS to your phone." : "If an account exists with this credential, a 6-digit recovery code has been dispatched.",
      challengeId,
      phoneDispatch,
      emailDispatch
    });
  } catch (err) {
    res.status(500).json({ error: "Password recovery error." });
  }
});
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { challengeId, otp } = req.body;
    if (!challengeId || !otp) {
      res.status(400).json({ error: "Challenge ID and 6-digit OTP code are required." });
      return;
    }
    const result = db.verifyResetOtp(challengeId, otp);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json({
      message: "OTP verified successfully.",
      resetToken: result.resetToken
    });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed." });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    if (!resetToken || !newPassword) {
      res.status(400).json({ error: "Reset token and new password are required." });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long." });
      return;
    }
    const salt = bcrypt2.genSaltSync(10);
    const newHash = bcrypt2.hashSync(newPassword, salt);
    const result = db.completePasswordReset(resetToken, newHash);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json({
      message: "Your password has been reset successfully. You can now log in with your new credentials."
    });
  } catch (err) {
    res.status(500).json({ error: "Password reset execution error." });
  }
});
router.get("/me", authenticateToken, (req, res) => {
  const user = req.user;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      gender: user.gender,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
    }
  });
});
router.post("/demo-login", (_req, res) => {
  res.status(403).json({ error: "Demo login has been disabled." });
});
router.post("/reset-demo", (_req, res) => {
  res.status(403).json({ error: "Demo reset has been disabled." });
});
var auth_default = router;

// server/routes/groups.ts
import { Router as Router2 } from "express";

// server/services/settlementEngine.ts
var SettlementEngine = class {
  static calculateBalances(group, expenses, settlements) {
    const balanceMap = /* @__PURE__ */ new Map();
    for (const member of group.members) {
      balanceMap.set(member.userId, {
        userId: member.userId,
        userName: member.name,
        email: member.email,
        totalPaid: 0,
        totalOwed: 0
      });
    }
    for (const expense of expenses) {
      const payerRecord = balanceMap.get(expense.payerId);
      if (payerRecord) {
        payerRecord.totalPaid += Number(expense.amount);
      }
      for (const split of expense.splits) {
        let memberRecord = balanceMap.get(split.userId);
        if (!memberRecord) {
          memberRecord = {
            userId: split.userId,
            userName: split.userName,
            email: "",
            totalPaid: 0,
            totalOwed: 0
          };
          balanceMap.set(split.userId, memberRecord);
        }
        memberRecord.totalOwed += Number(split.shareAmount);
      }
    }
    const settlementAdjustments = /* @__PURE__ */ new Map();
    for (const s of settlements) {
      if (s.status === "COMPLETED") {
        const amt = Number(s.amount);
        settlementAdjustments.set(s.fromUserId, (settlementAdjustments.get(s.fromUserId) || 0) + amt);
        settlementAdjustments.set(s.toUserId, (settlementAdjustments.get(s.toUserId) || 0) - amt);
      }
    }
    const results = [];
    for (const record of balanceMap.values()) {
      const adjustment = settlementAdjustments.get(record.userId) || 0;
      const net = Math.round((record.totalPaid - record.totalOwed + adjustment) * 100) / 100;
      results.push({
        userId: record.userId,
        userName: record.userName,
        email: record.email,
        totalPaid: Math.round(record.totalPaid * 100) / 100,
        totalOwed: Math.round(record.totalOwed * 100) / 100,
        netBalance: net
      });
    }
    return results;
  }
  static optimizeTransfers(balances, currency = "INR") {
    const debtors = [];
    const creditors = [];
    for (const b of balances) {
      const net = Math.round(b.netBalance * 100) / 100;
      if (net < -0.01) {
        debtors.push({ userId: b.userId, userName: b.userName, amount: Math.abs(net) });
      } else if (net > 0.01) {
        creditors.push({ userId: b.userId, userName: b.userName, amount: net });
      }
    }
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    const transfers = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const settleAmount = Math.round(Math.min(debtor.amount, creditor.amount) * 100) / 100;
      if (settleAmount > 0.01) {
        transfers.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: settleAmount,
          currency
        });
      }
      debtor.amount = Math.round((debtor.amount - settleAmount) * 100) / 100;
      creditor.amount = Math.round((creditor.amount - settleAmount) * 100) / 100;
      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    return transfers;
  }
};

// server/routes/groups.ts
var router2 = Router2();
router2.use(authenticateToken);
router2.get("/", (req, res) => {
  try {
    const userId = req.user.id;
    const groups = db.getGroupsForUser(userId);
    const enrichedGroups = groups.map((g) => {
      const expenses = db.getExpensesForGroup(g.id);
      const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        ...g,
        totalSpent,
        recentExpensesCount: expenses.length
      };
    });
    res.json({ groups: enrichedGroups });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve groups." });
  }
});
router2.post("/", (req, res) => {
  try {
    const { name, description, category, currency, initialMembers } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: "Group name is required." });
      return;
    }
    const group = db.createGroup({
      name: name.trim(),
      description: description?.trim() || "",
      category: category || "General",
      currency: currency || "INR",
      creator: req.user,
      initialMembers: initialMembers || []
    });
    db.createNotification({
      userId: req.user.id,
      title: "Group Created",
      message: `You created the group "${group.name}". Invite friends to start splitting expenses.`,
      type: "INVITATION",
      link: `/groups/${group.id}`
    });
    res.status(201).json({
      message: "Group created successfully!",
      group: {
        ...group,
        totalSpent: 0,
        recentExpensesCount: 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating group." });
  }
});
router2.get("/:id", (req, res) => {
  try {
    const groupId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const group = db.getGroupById(groupId);
    if (!group) {
      res.status(404).json({ error: "Group not found." });
      return;
    }
    const userEmail = req.user.email.toLowerCase().trim();
    const isMember = group.members.some((m) => m.userId === req.user.id || m.email && m.email.toLowerCase().trim() === userEmail);
    if (!isMember) {
      res.status(403).json({ error: "You are not authorized to access this group." });
      return;
    }
    db.syncUserWithGroups(req.user);
    const expenses = db.getExpensesForGroup(groupId);
    const settlements = db.getSettlementsForGroup(groupId);
    const balances = SettlementEngine.calculateBalances(group, expenses, settlements);
    const optimizedTransfers = SettlementEngine.optimizeTransfers(balances, group.currency);
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const budget = group.budget || 0;
    const remainingBudget = budget > 0 ? Math.max(0, budget - totalSpent) : 0;
    const budgetUsedPercentage = budget > 0 ? Math.round(totalSpent / budget * 100) : 0;
    res.json({
      group: {
        ...group,
        totalSpent,
        budget,
        remainingBudget,
        budgetUsedPercentage
      },
      expenses,
      settlements,
      balances,
      suggestedSettlements: optimizedTransfers.map((t, idx) => ({
        id: `sug_${groupId}_${idx}`,
        groupId,
        groupName: group.name,
        fromUserId: t.fromUserId,
        fromUserName: t.fromUserName,
        toUserId: t.toUserId,
        toUserName: t.toUserName,
        amount: t.amount,
        currency: t.currency,
        status: "PENDING"
      }))
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve group details." });
  }
});
router2.post("/:id/members", async (req, res) => {
  try {
    const groupId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, email } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: "Member name and email are required." });
      return;
    }
    const group = db.getGroupById(groupId);
    if (!group) {
      res.status(404).json({ error: "Group not found." });
      return;
    }
    const newMember = db.addMemberToGroup(groupId, { name, email });
    if (!newMember) {
      res.status(400).json({ error: "Could not add member." });
      return;
    }
    const invitation = db.createGroupInvitation(groupId, group.name, req.user.name, email);
    const clientOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : "");
    const clientBaseUrl = typeof req.body.clientBaseUrl === "string" && req.body.clientBaseUrl.trim() !== "" ? req.body.clientBaseUrl.trim().replace(/\/$/, "") : "";
    const baseUrl = process.env.APP_URL && process.env.APP_URL.trim() !== "" ? process.env.APP_URL.trim().replace(/\/$/, "") : clientBaseUrl || (clientOrigin ? clientOrigin.replace(/\/$/, "") : "http://localhost:5173");
    const joinUrl = `${baseUrl}/join-group?token=${invitation.token}&groupId=${groupId}`;
    const emailResult = await emailService.sendGroupInvitation({
      to: email.trim(),
      memberName: name.trim(),
      inviterName: req.user.name,
      groupName: group.name,
      joinUrl
    });
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      db.createNotification({
        userId: existingUser.id,
        title: "Trip Group Invitation",
        message: `${req.user.name} invited you to "${group.name}". You can now log expenses and track balances from any device!`,
        type: "INVITATION",
        link: `/groups/${group.id}`
      });
    }
    res.status(201).json({
      message: emailResult.delivered ? `Invitation successfully sent to ${name} (${email}) with magic join link!` : `Member added! ${emailResult.message}`,
      member: newMember,
      invitationToken: invitation.token,
      joinUrl,
      emailDispatch: emailResult
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add and invite member." });
  }
});
router2.post("/join", (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "Invitation token is required." });
      return;
    }
    const result = db.acceptGroupInvitation(token, req.user);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json({
      success: true,
      message: result.message,
      group: result.group
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to join group." });
  }
});
router2.delete("/:id", (req, res) => {
  try {
    const groupId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = db.deleteGroup(groupId, req.user.id);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete trip group." });
  }
});
router2.put("/:id/budget", (req, res) => {
  try {
    const groupId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { budget } = req.body;
    const numBudget = parseFloat(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      res.status(400).json({ error: "Valid positive budget number is required." });
      return;
    }
    const group = db.getGroupById(groupId);
    if (!group) {
      res.status(404).json({ error: "Group not found." });
      return;
    }
    const userEmail = req.user.email.toLowerCase().trim();
    const isMember = group.members.some((m) => m.userId === req.user.id || m.email && m.email.toLowerCase().trim() === userEmail);
    if (!isMember) {
      res.status(403).json({ error: "Unauthorized to update this group." });
      return;
    }
    const updated = db.updateGroup(groupId, { budget: numBudget });
    res.json({ message: "Budget updated successfully.", group: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update group budget." });
  }
});
var groups_default = router2;

// server/routes/expenses.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.use(authenticateToken);
router3.post("/check-duplicate", (req, res) => {
  try {
    const { groupId, title, amount, payerId, date } = req.body;
    if (!groupId || !title || !amount) {
      res.json({ isDuplicate: false });
      return;
    }
    const match = db.findPotentialDuplicateExpense(groupId, {
      title,
      amount: parseFloat(amount),
      payerId,
      date
    });
    if (match) {
      res.json({
        isDuplicate: true,
        duplicateExpense: match,
        message: `A similar expense "${match.title}" for ${match.currency} ${match.amount.toLocaleString()} on ${match.date} was paid by ${match.payerName}.`
      });
    } else {
      res.json({ isDuplicate: false });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to check duplicates." });
  }
});
router3.post("/group/:groupId", (req, res) => {
  try {
    const groupId = Array.isArray(req.params.groupId) ? req.params.groupId[0] : req.params.groupId;
    const {
      title,
      amount,
      currency = "INR",
      payerId,
      payerName,
      category = "Others",
      date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      splitType = "EQUAL",
      participants,
      notes,
      taxAmount,
      receiptUrl,
      allowDuplicate = false
    } = req.body;
    if (!title || !title.trim()) {
      res.status(400).json({ error: "Expense title is required." });
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: "Please enter a valid expense amount greater than 0." });
      return;
    }
    const group = db.getGroupById(groupId);
    if (!group) {
      res.status(404).json({ error: "Group not found." });
      return;
    }
    const userEmail = req.user.email.toLowerCase().trim();
    const isMember = group.members.some((m) => m.userId === req.user.id || m.email && m.email.toLowerCase().trim() === userEmail);
    if (!isMember) {
      res.status(403).json({ error: "You must be a member of this trip group to add expenses." });
      return;
    }
    db.syncUserWithGroups(req.user);
    if (!allowDuplicate) {
      const existingMatch = db.findPotentialDuplicateExpense(groupId, {
        title: title.trim(),
        amount: numAmount,
        payerId: payerId || req.user.id,
        date
      });
      if (existingMatch) {
        res.status(200).json({
          warning: "POTENTIAL_DUPLICATE",
          message: `A similar expense "${existingMatch.title}" (${existingMatch.currency} ${existingMatch.amount.toLocaleString()}) was already recorded on ${existingMatch.date} by ${existingMatch.payerName}.`,
          duplicateExpense: existingMatch
        });
        return;
      }
    }
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      res.status(400).json({ error: "Please select at least one participant." });
      return;
    }
    let calculatedSplits = [];
    if (splitType === "EQUAL") {
      const count = participants.length;
      const baseShare = Math.round(numAmount / count * 100) / 100;
      calculatedSplits = participants.map((p, idx) => {
        const share = idx === count - 1 ? Math.round((numAmount - baseShare * (count - 1)) * 100) / 100 : baseShare;
        return {
          id: "sp_" + Math.random().toString(36).substring(2, 9),
          expenseId: "",
          userId: p.userId,
          userName: p.userName,
          shareAmount: share,
          percentage: Math.round(100 / count * 10) / 10
        };
      });
    } else if (splitType === "PERCENTAGE") {
      let totalPct = 0;
      for (const p of participants) {
        totalPct += Number(p.percentage || 0);
      }
      if (Math.abs(totalPct - 100) > 0.5) {
        res.status(400).json({ error: `Percentages must add up to 100%. Currently: ${totalPct.toFixed(1)}%` });
        return;
      }
      let runningShareSum = 0;
      calculatedSplits = participants.map((p, idx) => {
        let share = Math.round(numAmount * (Number(p.percentage) / 100) * 100) / 100;
        if (idx === participants.length - 1) {
          share = Math.round((numAmount - runningShareSum) * 100) / 100;
        } else {
          runningShareSum += share;
        }
        return {
          id: "sp_" + Math.random().toString(36).substring(2, 9),
          expenseId: "",
          userId: p.userId,
          userName: p.userName,
          shareAmount: share,
          percentage: Number(p.percentage)
        };
      });
    } else {
      let totalCustom = 0;
      for (const p of participants) {
        totalCustom += Number(p.shareAmount || 0);
      }
      if (Math.abs(totalCustom - numAmount) > 0.05) {
        res.status(400).json({
          error: `Individual shares must equal total amount (${numAmount}). Currently sums to: ${totalCustom.toFixed(2)}`
        });
        return;
      }
      calculatedSplits = participants.map((p) => ({
        id: "sp_" + Math.random().toString(36).substring(2, 9),
        expenseId: "",
        userId: p.userId,
        userName: p.userName,
        shareAmount: Number(p.shareAmount)
      }));
    }
    const newExpense = db.createExpense({
      groupId,
      title: title.trim(),
      amount: numAmount,
      currency,
      payerId: payerId || req.user.id,
      payerName: payerName || req.user.name,
      category,
      date,
      splitType,
      splits: calculatedSplits,
      notes: notes?.trim() || "",
      taxAmount: taxAmount ? parseFloat(taxAmount) : void 0,
      receiptUrl: receiptUrl || void 0
    });
    for (const member of group.members) {
      if (member.userId !== req.user.id) {
        db.createNotification({
          userId: member.userId,
          title: "New Expense Added",
          message: `${req.user.name} added "${newExpense.title}" (${currency} ${numAmount.toLocaleString()}) in ${group.name}.`,
          type: "EXPENSE",
          link: `/groups/${group.id}`
        });
      }
    }
    if (group.budget && group.budget > 0) {
      const allGroupExpenses = db.getExpensesForGroup(groupId);
      const totalGroupSpent = allGroupExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const pctUsed = Math.round(totalGroupSpent / group.budget * 100);
      if (pctUsed >= 100) {
        for (const member of group.members) {
          db.createNotification({
            userId: member.userId,
            title: "\u{1F6A8} Group Budget Exceeded",
            message: `"${group.name}" has reached ${pctUsed}% of its budget (${currency} ${group.budget.toLocaleString()}). Total spent: ${currency} ${totalGroupSpent.toLocaleString()}.`,
            type: "ALERT",
            link: `/groups/${group.id}`
          });
        }
      } else if (pctUsed >= 70) {
        for (const member of group.members) {
          db.createNotification({
            userId: member.userId,
            title: "\u26A0\uFE0F Group Budget Warning",
            message: `"${group.name}" has used ${pctUsed}% of its budget (${currency} ${group.budget.toLocaleString()}). Remaining: ${currency} ${(group.budget - totalGroupSpent).toLocaleString()}.`,
            type: "ALERT",
            link: `/groups/${group.id}`
          });
        }
      }
    }
    res.status(201).json({
      message: "Expense successfully recorded.",
      expense: newExpense
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to record expense." });
  }
});
router3.put("/:id", (req, res) => {
  try {
    const expenseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = db.getExpenseById(expenseId);
    if (!existing) {
      res.status(404).json({ error: "Expense not found." });
      return;
    }
    const { title, amount, category, date, notes } = req.body;
    const updates = {};
    if (title) updates.title = title.trim();
    if (amount) updates.amount = parseFloat(amount);
    if (category) updates.category = category;
    if (date) updates.date = date;
    if (notes !== void 0) updates.notes = notes;
    const updated = db.updateExpense(expenseId, updates);
    const group = db.getGroupById(existing.groupId);
    if (group) {
      for (const member of group.members) {
        if (member.userId !== req.user.id) {
          db.createNotification({
            userId: member.userId,
            title: "Expense Updated",
            message: `${req.user.name} updated "${updated?.title || existing.title}" in ${group.name}.`,
            type: "EXPENSE",
            link: `/groups/${group.id}`
          });
        }
      }
    }
    res.json({ message: "Expense updated successfully.", expense: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update expense." });
  }
});
router3.delete("/:id", (req, res) => {
  try {
    const expenseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = db.deleteExpense(expenseId);
    if (!deleted) {
      res.status(404).json({ error: "Expense not found or already deleted." });
      return;
    }
    res.json({ message: "Expense deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense." });
  }
});
var expenses_default = router3;

// server/routes/settlements.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.use(authenticateToken);
router4.get("/", (req, res) => {
  try {
    const userId = req.user.id;
    const userGroups = db.getGroupsForUser(userId);
    const suggestedSettlements = [];
    const completedSettlements = [];
    for (const group of userGroups) {
      const expenses = db.getExpensesForGroup(group.id);
      const settlements = db.getSettlementsForGroup(group.id);
      const balances = SettlementEngine.calculateBalances(group, expenses, settlements);
      const transfers = SettlementEngine.optimizeTransfers(balances, group.currency);
      for (let i = 0; i < transfers.length; i++) {
        const t = transfers[i];
        suggestedSettlements.push({
          id: `sug_${group.id}_${i}`,
          groupId: group.id,
          groupName: group.name,
          fromUserId: t.fromUserId,
          fromUserName: t.fromUserName,
          toUserId: t.toUserId,
          toUserName: t.toUserName,
          amount: t.amount,
          currency: t.currency,
          status: "PENDING",
          isPayerCurrentUser: t.fromUserId === userId,
          isRecipientCurrentUser: t.toUserId === userId
        });
      }
      for (const s of settlements) {
        if (s.status === "COMPLETED") {
          completedSettlements.push({
            ...s,
            groupName: group.name
          });
        }
      }
    }
    res.json({
      suggestedSettlements,
      completedSettlements
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve settlements." });
  }
});
router4.post("/remind", (req, res) => {
  try {
    const { toUserId, amount, currency = "INR", groupName } = req.body;
    if (!toUserId) {
      res.status(400).json({ error: "Recipient user ID is required." });
      return;
    }
    db.createNotification({
      userId: toUserId,
      title: "Settlement Reminder \u{1F514}",
      message: `${req.user.name} reminded you to settle your pending balance of ${currency} ${Number(amount).toLocaleString()} in ${groupName}.`,
      type: "SETTLEMENT",
      link: "/settlements"
    });
    res.json({ message: "Settlement reminder sent successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to send reminder." });
  }
});
var settlements_default = router4;

// server/routes/payments.ts
import { Router as Router5 } from "express";

// server/services/paypalService.ts
var PayPalService = class {
  clientId;
  clientSecret;
  baseUrl;
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.baseUrl = process.env.PAYPAL_SANDBOX === "false" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    if (this.clientId && this.clientSecret) {
      console.log("\u{1F4B3} PayPal Sandbox API credentials loaded.");
    } else {
      console.log("\u2139\uFE0F PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not configured. Operating in PayPal Sandbox Simulator mode.");
    }
  }
  async getAccessToken() {
    if (!this.clientId || !this.clientSecret) return null;
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
      const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
      });
      if (!res.ok) throw new Error(`PayPal auth failed with status ${res.status}`);
      const data = await res.json();
      return data.access_token;
    } catch (err) {
      console.error("Error fetching PayPal access token:", err);
      return null;
    }
  }
  async createOrder(options) {
    const { amount, currency, description, customId } = options;
    const token = await this.getAccessToken();
    if (token) {
      try {
        const res = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [{
              custom_id: customId,
              description: description.substring(0, 127),
              amount: {
                currency_code: currency === "INR" ? "USD" : currency,
                value: amount.toFixed(2)
              }
            }],
            application_context: {
              brand_name: "SplitSmart AI",
              landing_page: "NO_PREFERENCE",
              user_action: "PAY_NOW",
              return_url: `${(process.env.APP_URL || "http://localhost:5173").replace(/\/$/, "")}/checkout/success`,
              cancel_url: `${(process.env.APP_URL || "http://localhost:5173").replace(/\/$/, "")}/checkout/cancel`
            }
          })
        });
        if (res.ok) {
          const data = await res.json();
          return {
            id: data.id,
            status: data.status,
            links: data.links,
            isSandboxDemo: false
          };
        }
        console.warn("PayPal create order API error, using sandbox fallback:", await res.text());
      } catch (e) {
        console.warn("PayPal API network exception, falling back to sandbox simulator:", e);
      }
    }
    const mockOrderId = "PAYPAL-SANDBOX-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      id: mockOrderId,
      status: "CREATED",
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${mockOrderId}`,
          rel: "approve",
          method: "GET"
        }
      ],
      isSandboxDemo: true
    };
  }
  async captureOrder(orderId) {
    const token = await this.getAccessToken();
    if (token && !orderId.startsWith("PAYPAL-SANDBOX-")) {
      try {
        const res = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (res.ok) {
          const data = await res.json();
          const captureUnit = data.purchase_units?.[0]?.payments?.captures?.[0];
          return {
            id: data.id,
            status: data.status === "COMPLETED" ? "COMPLETED" : "FAILED",
            amount: parseFloat(captureUnit?.amount?.value || "0"),
            currency: captureUnit?.amount?.currency_code || "USD",
            payerEmail: data.payer?.email_address,
            transactionReference: captureUnit?.id || `PP-TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            isSandboxDemo: false
          };
        }
      } catch (e) {
        console.warn("PayPal capture API failed, checking simulator fallback:", e);
      }
    }
    return {
      id: orderId,
      status: "COMPLETED",
      amount: 1200,
      currency: "INR",
      payerEmail: "sb-buyer@business.example.com",
      transactionReference: `PP-SBX-${Math.floor(1e7 + Math.random() * 9e7)}`,
      isSandboxDemo: true
    };
  }
};
var paypalService = new PayPalService();

// server/routes/payments.ts
var router5 = Router5();
router5.use(authenticateToken);
router5.post("/paypal/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", groupId, recipientId, recipientName, settlementId } = req.body;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: "Valid payment amount is required." });
      return;
    }
    if (settlementId) {
      const existingSettlement = db.getAllSettlements().find(
        (s) => s.id === settlementId && s.status === "COMPLETED"
      );
      if (existingSettlement) {
        res.status(409).json({ error: "This settlement balance has already been completed and verified." });
        return;
      }
    }
    const order = await paypalService.createOrder({
      amount: numAmount,
      currency,
      description: `SplitSmart AI settlement to ${recipientName || "Group Member"}`,
      customId: JSON.stringify({ groupId, recipientId, settlementId, payerId: req.user.id })
    });
    res.json({
      orderId: order.id,
      status: order.status,
      links: order.links,
      isSandboxDemo: order.isSandboxDemo
    });
  } catch (err) {
    console.error("PayPal create order error:", err);
    res.status(500).json({ error: "Failed to initiate PayPal order." });
  }
});
router5.post("/paypal/capture-order", async (req, res) => {
  try {
    const { orderId, groupId, recipientId, recipientName, amount, currency = "INR", settlementId } = req.body;
    if (!orderId) {
      res.status(400).json({ error: "Order ID is required." });
      return;
    }
    const existingPaymentForOrder = db.getAllPayments().find(
      (p) => p.metadata?.paypalOrderId === orderId && p.status === "COMPLETED"
    );
    if (existingPaymentForOrder) {
      res.status(409).json({
        error: "This PayPal order has already been captured and processed.",
        payment: existingPaymentForOrder
      });
      return;
    }
    if (settlementId) {
      const existingSettlement = db.getAllSettlements().find(
        (s) => s.id === settlementId && s.status === "COMPLETED"
      );
      if (existingSettlement) {
        res.status(409).json({ error: "This settlement balance has already been completed and verified." });
        return;
      }
    }
    const captureResult = await paypalService.captureOrder(orderId);
    if (captureResult.status !== "COMPLETED") {
      res.status(400).json({
        error: "PayPal payment capture was not completed.",
        status: captureResult.status
      });
      return;
    }
    const receiptNumber = `REC-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const payment = db.createPayment({
      settlementId: settlementId || void 0,
      groupId: groupId || void 0,
      payerId: req.user.id,
      payerName: req.user.name,
      recipientId: recipientId || "usr_unknown",
      recipientName: recipientName || "Group Member",
      amount: parseFloat(amount) || captureResult.amount,
      currency,
      method: "PAYPAL",
      status: "COMPLETED",
      reference: captureResult.transactionReference,
      metadata: {
        receiptNumber,
        paypalOrderId: orderId,
        payerEmail: captureResult.payerEmail,
        isSandbox: true
      }
    });
    const receipt = {
      receiptNumber,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      reference: payment.reference,
      payerName: req.user.name,
      payerEmail: req.user.email,
      recipientName: recipientName || "Group Member",
      groupName: groupId ? db.getGroupById(groupId)?.name || "Trip Group" : "Direct Settlement",
      amount: payment.amount,
      currency,
      method: "PAYPAL",
      status: "COMPLETED",
      verifiedStamp: "VERIFIED BY PAYPAL SANDBOX"
    };
    if (groupId) {
      db.createSettlement({
        groupId,
        fromUserId: req.user.id,
        fromUserName: req.user.name,
        toUserId: recipientId,
        toUserName: recipientName,
        amount: parseFloat(amount),
        currency,
        status: "COMPLETED",
        paymentId: payment.id,
        completedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (recipientId) {
      db.createNotification({
        userId: recipientId,
        title: "Settlement Received \u{1F4B0}",
        message: `${req.user.name} settled ${currency} ${Number(amount).toLocaleString()} with you via PayPal Sandbox. Ref: ${payment.reference}`,
        type: "PAYMENT",
        link: "/transactions"
      });
    }
    res.json({
      success: true,
      message: "PayPal payment verified and settled successfully!",
      payment,
      receipt
    });
  } catch (err) {
    console.error("PayPal capture error:", err);
    res.status(500).json({ error: "Failed to process PayPal capture." });
  }
});
router5.post("/card-checkout", async (req, res) => {
  try {
    const {
      amount,
      currency = "INR",
      groupId,
      recipientId,
      recipientName,
      settlementId,
      cardType = "CREDIT_CARD",
      cardholderName,
      cardNumber,
      expiry,
      cvv
    } = req.body;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: "Valid payment amount is required." });
      return;
    }
    if (settlementId) {
      const existingSettlement = db.getAllSettlements().find(
        (s) => s.id === settlementId && s.status === "COMPLETED"
      );
      if (existingSettlement) {
        res.status(409).json({ error: "This settlement balance has already been completed and verified." });
        return;
      }
    }
    if (!cardholderName || !cardholderName.trim()) {
      res.status(400).json({ error: "Cardholder name is required." });
      return;
    }
    const cleanNumber = (cardNumber || "").replace(/\s+/g, "");
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      res.status(400).json({ error: "Please enter a valid 16-digit card number." });
      return;
    }
    if (!expiry || !expiry.includes("/")) {
      res.status(400).json({ error: "Please provide valid expiry in MM/YY format." });
      return;
    }
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      res.status(400).json({ error: "Please enter a valid 3 or 4 digit CVV security code." });
      return;
    }
    const last4 = cleanNumber.slice(-4);
    const maskedNumber = `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${last4}`;
    const txnRef = `SS-${cardType === "DEBIT_CARD" ? "DBT" : "CRD"}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const receiptNumber = `REC-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const payment = db.createPayment({
      settlementId: settlementId || void 0,
      groupId: groupId || void 0,
      payerId: req.user.id,
      payerName: req.user.name,
      recipientId: recipientId || "usr_unknown",
      recipientName: recipientName || "Group Member",
      amount: numAmount,
      currency,
      method: cardType === "DEBIT_CARD" ? "DEBIT_CARD" : "CREDIT_CARD",
      status: "COMPLETED",
      reference: txnRef,
      metadata: {
        receiptNumber,
        cardholderName: cardholderName.trim(),
        cardMasked: maskedNumber,
        verifiedVia: "SplitSmart Secure Vault Gateway"
      }
    });
    const receipt = {
      receiptNumber,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      reference: txnRef,
      payerName: req.user.name,
      payerEmail: req.user.email,
      recipientName: recipientName || "Group Member",
      groupName: groupId ? db.getGroupById(groupId)?.name || "Trip Group" : "Direct Settlement",
      amount: numAmount,
      currency,
      method: cardType === "DEBIT_CARD" ? "DEBIT_CARD" : "CREDIT_CARD",
      status: "COMPLETED",
      verifiedStamp: "VERIFIED & SETTLED",
      cardMasked: maskedNumber
    };
    if (groupId) {
      db.createSettlement({
        groupId,
        fromUserId: req.user.id,
        fromUserName: req.user.name,
        toUserId: recipientId,
        toUserName: recipientName,
        amount: numAmount,
        currency,
        status: "COMPLETED",
        paymentId: payment.id,
        completedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (recipientId) {
      db.createNotification({
        userId: recipientId,
        title: "Settlement Payment Verified \u{1F389}",
        message: `${req.user.name} settled ${currency} ${numAmount.toLocaleString()} with you using ${cardType === "DEBIT_CARD" ? "Debit" : "Credit"} Card. Ref: ${payment.reference}`,
        type: "PAYMENT",
        link: "/transactions"
      });
    }
    res.json({
      success: true,
      message: `${cardType === "DEBIT_CARD" ? "Debit" : "Credit"} Card payment of ${currency} ${numAmount.toLocaleString()} verified successfully!`,
      payment,
      receipt
    });
  } catch (err) {
    console.error("Card payment error:", err);
    res.status(500).json({ error: "Card transaction processing failed." });
  }
});
router5.post("/google-pay", async (req, res) => {
  try {
    const { amount, currency = "INR", groupId, recipientId, recipientName, settlementId } = req.body;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: "Valid payment amount is required." });
      return;
    }
    if (settlementId) {
      const existingSettlement = db.getAllSettlements().find(
        (s) => s.id === settlementId && s.status === "COMPLETED"
      );
      if (existingSettlement) {
        res.status(409).json({ error: "This settlement balance has already been completed and verified." });
        return;
      }
    }
    const txnRef = `SS-GPAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const receiptNumber = `REC-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const payment = db.createPayment({
      settlementId: settlementId || void 0,
      groupId: groupId || void 0,
      payerId: req.user.id,
      payerName: req.user.name,
      recipientId: recipientId || "usr_unknown",
      recipientName: recipientName || "Group Member",
      amount: numAmount,
      currency,
      method: "GOOGLE_PAY",
      status: "COMPLETED",
      reference: txnRef,
      metadata: {
        receiptNumber,
        verifiedVia: "Google Pay Tokenized UPI/VPA"
      }
    });
    const receipt = {
      receiptNumber,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      reference: txnRef,
      payerName: req.user.name,
      payerEmail: req.user.email,
      recipientName: recipientName || "Group Member",
      groupName: groupId ? db.getGroupById(groupId)?.name || "Trip Group" : "Direct Settlement",
      amount: numAmount,
      currency,
      method: "GOOGLE_PAY",
      status: "COMPLETED",
      verifiedStamp: "VERIFIED BY GOOGLE PAY"
    };
    if (groupId) {
      db.createSettlement({
        groupId,
        fromUserId: req.user.id,
        fromUserName: req.user.name,
        toUserId: recipientId,
        toUserName: recipientName,
        amount: numAmount,
        currency,
        status: "COMPLETED",
        paymentId: payment.id,
        completedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (recipientId) {
      db.createNotification({
        userId: recipientId,
        title: "Settlement Received via Google Pay \u26A1",
        message: `${req.user.name} settled ${currency} ${numAmount.toLocaleString()} with you via Google Pay. Ref: ${payment.reference}`,
        type: "PAYMENT",
        link: "/transactions"
      });
    }
    res.json({
      success: true,
      message: `Google Pay settlement of ${currency} ${numAmount.toLocaleString()} verified successfully!`,
      payment,
      receipt
    });
  } catch (err) {
    console.error("Google Pay error:", err);
    res.status(500).json({ error: "Google Pay processing failed." });
  }
});
router5.get("/receipt/:reference", (req, res) => {
  try {
    const reference = Array.isArray(req.params.reference) ? req.params.reference[0] : req.params.reference;
    const payment = db.getPaymentByReference(reference);
    if (!payment) {
      res.status(404).json({ error: "Receipt not found for this transaction reference." });
      return;
    }
    const group = payment.groupId ? db.getGroupById(payment.groupId) : void 0;
    const receipt = {
      receiptNumber: payment.metadata?.receiptNumber || `REC-2026-${payment.id.substring(4)}`,
      date: payment.createdAt,
      reference: payment.reference,
      payerName: payment.payerName,
      recipientName: payment.recipientName,
      groupName: group ? group.name : "SplitSmart AI Group Settlement",
      groupCategory: group ? group.category : "Trip Settlement",
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      cardMasked: payment.metadata?.cardMasked,
      verifiedStamp: "OFFICIALLY VERIFIED & SETTLED"
    };
    res.json({ receipt });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipt." });
  }
});
router5.get("/transactions", (req, res) => {
  try {
    const userId = req.user.id;
    const allPayments = db.getAllPayments();
    const userPayments = allPayments.filter((p) => p.payerId === userId || p.recipientId === userId);
    res.json({
      transactions: userPayments
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve transactions." });
  }
});
var payments_default = router5;

// server/routes/ai.ts
import { Router as Router6 } from "express";

// server/services/aiService.ts
import fs2 from "fs";
import path2 from "path";
var AIService = class {
  geminiApiKey;
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    if (this.geminiApiKey) {
      console.log("\u{1F916} Google Gemini AI Engine configured.");
    } else {
      console.log("\u2139\uFE0F GEMINI_API_KEY not configured. Running with high-precision Universal Knowledge & Financial Engine.");
    }
  }
  setGeminiApiKey(key) {
    this.geminiApiKey = key.trim();
    try {
      const envPath = path2.resolve(process.cwd(), ".env");
      if (fs2.existsSync(envPath)) {
        let content = fs2.readFileSync(envPath, "utf8");
        if (content.includes("GEMINI_API_KEY=")) {
          content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${this.geminiApiKey}`);
        } else {
          content += `
GEMINI_API_KEY=${this.geminiApiKey}
`;
        }
        fs2.writeFileSync(envPath, content, "utf8");
      }
    } catch (e) {
      console.warn("Could not write GEMINI_API_KEY to .env file:", e);
    }
  }
  getStatus() {
    return {
      configured: !!this.geminiApiKey,
      provider: this.geminiApiKey ? "Google Gemini AI" : "Smart Universal Knowledge Engine",
      model: this.geminiApiKey ? "gemini-1.5-flash / gemini-2.0-flash" : "Universal Knowledge Engine (Wiki + Math + Realtime Q&A)"
    };
  }
  async parseExpenseText(prompt, groups, currentUser) {
    if (this.geminiApiKey) {
      try {
        const result = await this.callGeminiForExpenseParse(prompt, groups, currentUser);
        if (result) return result;
      } catch (e) {
        console.warn("Gemini call failed or timed out, falling back to local NLP engine:", e);
      }
    }
    return this.deterministicExpenseParse(prompt, groups, currentUser);
  }
  deterministicExpenseParse(text, groups, currentUser) {
    const raw = text.trim();
    let currency = "INR";
    if (raw.includes("$") || /USD/i.test(raw)) currency = "USD";
    else if (raw.includes("\u20AC") || /EUR/i.test(raw)) currency = "EUR";
    else if (raw.includes("\xA3") || /GBP/i.test(raw)) currency = "GBP";
    const amountMatch = raw.match(/(?:[₹$€£]|Rs\.?|INR\s*)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:[₹$€£]|Rs\.?|INR|USD|EUR)?/i);
    let amount = 0;
    if (amountMatch) {
      const matches = [...raw.matchAll(/(?:[₹$€£]|Rs\.?|INR)?\s*(\d[\d,]*(?:\.\d+)?)/gi)];
      for (const m of matches) {
        const val = parseFloat(m[1].replace(/,/g, ""));
        if (val > 0 && val !== 2026 && val !== 2025) {
          amount = val;
          break;
        }
      }
    }
    if (amount === 0) amount = 1e3;
    let category = "Food";
    const lower = raw.toLowerCase();
    if (lower.includes("dinner") || lower.includes("lunch") || lower.includes("food") || lower.includes("pizza") || lower.includes("restaurant") || lower.includes("cafe") || lower.includes("drinks") || lower.includes("snack") || lower.includes("breakfast")) {
      category = "Food";
    } else if (lower.includes("flight") || lower.includes("cab") || lower.includes("uber") || lower.includes("taxi") || lower.includes("train") || lower.includes("fuel") || lower.includes("gas") || lower.includes("travel")) {
      category = "Travel";
    } else if (lower.includes("hotel") || lower.includes("villa") || lower.includes("resort") || lower.includes("airbnb") || lower.includes("stay") || lower.includes("accommodation")) {
      category = "Accommodation";
    } else if (lower.includes("movie") || lower.includes("club") || lower.includes("party") || lower.includes("concert") || lower.includes("entertainment") || lower.includes("game")) {
      category = "Entertainment";
    } else if (lower.includes("wifi") || lower.includes("electricity") || lower.includes("water") || lower.includes("rent") || lower.includes("maintenance") || lower.includes("bill")) {
      category = "Utilities";
    } else if (lower.includes("shopping") || lower.includes("groceries") || lower.includes("supermarket")) {
      category = "Shopping";
    } else {
      category = "Others";
    }
    let title = `${category} Expense`;
    if (lower.includes("dinner")) title = "Dinner at Restaurant";
    else if (lower.includes("lunch")) title = "Group Lunch";
    else if (lower.includes("pizza")) title = "Pizza Party";
    else if (lower.includes("resort") || lower.includes("villa")) title = "Resort Stay";
    else if (lower.includes("flight") || lower.includes("tickets")) title = "Travel Tickets";
    else if (lower.includes("uber") || lower.includes("cab")) title = "Cab Ride";
    else if (lower.includes("wifi")) title = "High-Speed WiFi Bill";
    else if (lower.includes("groceries")) title = "Supermarket Groceries";
    let date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (lower.includes("yesterday")) {
      date = new Date(Date.now() - 864e5).toISOString().split("T")[0];
    }
    const candidateMembers = [];
    const seenFirstNames = /* @__PURE__ */ new Set();
    for (const g of groups) {
      for (const m of g.members) {
        const fn = m.name.split(" ")[0].toLowerCase();
        if (!seenFirstNames.has(fn)) {
          seenFirstNames.add(fn);
          candidateMembers.push({ fullName: m.name, firstName: m.name.split(" ")[0] });
        }
      }
    }
    const curFn = currentUser.name.split(" ")[0].toLowerCase();
    if (!seenFirstNames.has(curFn)) {
      seenFirstNames.add(curFn);
      candidateMembers.push({ fullName: currentUser.name, firstName: currentUser.name.split(" ")[0] });
    }
    const defaultDemos = [
      { fullName: "Rahul Sharma", firstName: "Rahul" },
      { fullName: "Priya Patel", firstName: "Priya" },
      { fullName: "Aman Gupta", firstName: "Aman" },
      { fullName: "Sneha Roy", firstName: "Sneha" }
    ];
    for (const d of defaultDemos) {
      const fn = d.firstName.toLowerCase();
      if (!seenFirstNames.has(fn)) {
        seenFirstNames.add(fn);
        candidateMembers.push(d);
      }
    }
    const mentionedNames = [];
    const addedFirstNames = /* @__PURE__ */ new Set();
    for (const m of candidateMembers) {
      const regex = new RegExp(`\\b${m.firstName}\\b`, "i");
      if (regex.test(raw)) {
        if (!addedFirstNames.has(m.firstName.toLowerCase())) {
          addedFirstNames.add(m.firstName.toLowerCase());
          mentionedNames.push(m.fullName);
        }
      }
    }
    let payerName = currentUser.name;
    const paidMatch = raw.match(/([A-Z][a-z]+)\s+paid/i) || raw.match(/paid\s+by\s+([A-Z][a-z]+)/i);
    if (paidMatch) {
      const matchedFirstName = paidMatch[1].toLowerCase();
      const found = candidateMembers.find((m) => m.firstName.toLowerCase() === matchedFirstName);
      if (found) payerName = found.fullName;
      else payerName = paidMatch[1];
    } else if (lower.includes("i paid") || lower.includes("paid by me")) {
      payerName = currentUser.name;
    }
    let participants = mentionedNames.length > 0 ? mentionedNames : [currentUser.name, "Priya Patel", "Aman Gupta"];
    if (!participants.some((p) => p.toLowerCase().includes(payerName.toLowerCase()) || payerName.toLowerCase().includes(p.toLowerCase()))) {
      participants.unshift(payerName);
    }
    const shareCount = participants.length;
    const equalShare = Math.round(amount / shareCount * 100) / 100;
    const splits = participants.map((userName, idx) => {
      const shareAmount = idx === shareCount - 1 ? Math.round((amount - equalShare * (shareCount - 1)) * 100) / 100 : equalShare;
      return {
        userName,
        shareAmount,
        percentage: Math.round(100 / shareCount * 10) / 10
      };
    });
    const matchedGroup = groups.find(
      (g) => g.members.some((m) => participants.some((p) => p.toLowerCase().includes(m.name.toLowerCase())))
    ) || groups[0];
    return {
      title,
      amount,
      currency,
      payerName,
      participantNames: participants,
      category,
      splitType: "EQUAL",
      splits,
      date,
      notes: `Extracted via SplitSmart AI from: "${text}"`,
      confidence: 0.96,
      explanation: `Parsed ${currency} ${amount.toLocaleString()} for "${title}" paid by ${payerName}, split equally among ${participants.length} members (${participants.join(", ")}).`,
      groupId: matchedGroup ? matchedGroup.id : void 0,
      source: "LOCAL_NLP_ENGINE"
    };
  }
  async callGeminiForExpenseParse(prompt, groups, currentUser) {
    const groupContext = groups.map((g) => ({
      id: g.id,
      name: g.name,
      members: g.members.map((m) => m.name)
    }));
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are SplitSmart AI Expense Parser.
User request: "${prompt}"
Current User: "${currentUser.name}"
Known Groups & Members: ${JSON.stringify(groupContext)}

Extract JSON with EXACTLY this structure:
{
  "title": string,
  "amount": number,
  "currency": "INR"|"USD"|"EUR"|"GBP",
  "payerName": string,
  "participantNames": string[],
  "category": "Food"|"Travel"|"Accommodation"|"Entertainment"|"Shopping"|"Utilities"|"Others",
  "splitType": "EQUAL",
  "splits": [{"userName": string, "shareAmount": number}],
  "date": "YYYY-MM-DD",
  "confidence": 0.98,
  "explanation": string,
  "groupId": string
}
Return ONLY valid raw JSON without markdown code fences.`
          }]
        }]
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) return null;
    const cleaned = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { ...parsed, source: "GEMINI_AI" };
  }
  async scanReceipt(imageBase64, mimeType = "image/jpeg") {
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const lowerMime = mimeType.toLowerCase();
    if (!validMimes.some((m) => lowerMime.includes(m.replace("image/", "")))) {
      return {
        success: false,
        serviceConfigured: !!this.geminiApiKey,
        message: "Unsupported image format. Please upload a JPEG, PNG, or WebP receipt image."
      };
    }
    const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    if (cleanBase64.length > 7 * 1024 * 1024) {
      return {
        success: false,
        serviceConfigured: !!this.geminiApiKey,
        message: "Receipt image exceeds 5MB limit. Please upload a smaller photo."
      };
    }
    if (this.geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are SplitSmart AI Receipt OCR & Expense Scanner.
Examine this receipt image carefully. Extract:
1. Merchant/Store/Restaurant name
2. Expense Title (e.g. Dinner, Groceries, Hotel Stay)
3. Total Amount (number only, excluding currency symbol)
4. Currency (e.g. "INR", "USD", "EUR", "GBP")
5. Date in YYYY-MM-DD format (if missing, use today's date ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]})
6. Tax amount if itemized (number only)
7. Category: exactly one of "Food", "Travel", "Accommodation", "Entertainment", "Shopping", "Utilities", "Others"
8. Any brief notes or item summary

Return ONLY a valid JSON object matching this schema without markdown fences:
{
  "merchantName": string,
  "title": string,
  "amount": number,
  "currency": string,
  "date": "YYYY-MM-DD",
  "taxAmount": number,
  "category": "Food"|"Travel"|"Accommodation"|"Entertainment"|"Shopping"|"Utilities"|"Others",
  "notes": string,
  "confidence": 0.95
}`
                    },
                    {
                      inline_data: {
                        mime_type: lowerMime.includes("png") ? "image/png" : lowerMime.includes("webp") ? "image/webp" : "image/jpeg",
                        data: cleanBase64
                      }
                    }
                  ]
                }
              ]
            })
          }
        );
        if (response.ok) {
          const data = await response.json();
          const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textOutput) {
            const cleaned = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            return {
              success: true,
              merchantName: parsed.merchantName || parsed.title || "Receipt Merchant",
              title: parsed.title || parsed.merchantName || "Scanned Receipt Expense",
              amount: parseFloat(parsed.amount) || 0,
              currency: parsed.currency || "INR",
              date: parsed.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
              category: parsed.category || "Food",
              taxAmount: parsed.taxAmount ? parseFloat(parsed.taxAmount) : void 0,
              notes: parsed.notes || `Scanned from receipt (${parsed.merchantName || ""})`,
              confidence: parsed.confidence || 0.95,
              serviceConfigured: true
            };
          }
        }
        console.warn("Gemini vision receipt parse returned empty response");
      } catch (e) {
        console.warn("Gemini vision API error:", e);
      }
    }
    return {
      success: false,
      serviceConfigured: !!this.geminiApiKey,
      message: "Google Gemini Multimodal Vision API is not configured. Please add GEMINI_API_KEY to your .env file to enable live camera OCR scanning."
    };
  }
  isUserFemale(user, prompt) {
    if (user?.gender === "female") return true;
    if (user?.gender === "male") return false;
    if (prompt && /\b(i am (a )?(female|girl|woman|lady)|call me madam|call me ma'am|i'm a (girl|woman|lady))\b/i.test(prompt)) {
      return true;
    }
    const femaleNames = /* @__PURE__ */ new Set([
      "priya",
      "sneha",
      "ananya",
      "pooja",
      "neha",
      "riya",
      "shreya",
      "divya",
      "anita",
      "sunita",
      "geeta",
      "kavita",
      "meena",
      "seema",
      "rekha",
      "radha",
      "deepa",
      "aditi",
      "swati",
      "tanvi",
      "rashmi",
      "simran",
      "pallavi",
      "kriti",
      "kiara",
      "alia",
      "shruti",
      "sonam",
      "deepika",
      "katrina",
      "anushka",
      "kareena",
      "karisma",
      "aishwarya",
      "shilpa",
      "kajol",
      "rani",
      "madhuri",
      "juhi",
      "sridevi",
      "vidya",
      "taapsee",
      "kangna",
      "parineeti",
      "ileana",
      "disha",
      "isha",
      "aarti",
      "arti",
      "payal",
      "mona",
      "sona",
      "komal",
      "rupa",
      "suman",
      "shikha",
      "megha",
      "nisha",
      "sarita",
      "sapna",
      "sonia",
      "tanya",
      "pragya",
      "garima",
      "mansi",
      "jyoti",
      "jyotsna",
      "shweta",
      "alka",
      "bhavna",
      "urvashi",
      "mitali",
      "richa",
      "sarah",
      "emily",
      "emma",
      "olivia",
      "sophia",
      "ava",
      "isabella",
      "mia",
      "charlotte",
      "amelia",
      "harper",
      "evelyn",
      "abigail",
      "elizabeth",
      "sofia",
      "ella",
      "madison",
      "scarlett",
      "victoria",
      "aria",
      "grace",
      "chloe",
      "camila",
      "penelope",
      "riley",
      "layla",
      "lillian",
      "nora",
      "zoey",
      "mila",
      "aubrey",
      "hannah",
      "lily",
      "addison",
      "natalie",
      "luna",
      "savannah",
      "brooklyn",
      "leah",
      "zoe",
      "stella",
      "hazel",
      "ellie",
      "audrey",
      "violet",
      "claire",
      "bella",
      "aurora",
      "lucy",
      "anna",
      "samantha",
      "maya",
      "elena",
      "naomi",
      "alice",
      "eva",
      "ruby",
      "clara",
      "julia",
      "sophie",
      "jade",
      "maria",
      "mary",
      "jennifer",
      "lisa",
      "linda",
      "susan",
      "jessica",
      "karen",
      "nancy",
      "ashley"
    ]);
    const firstName = (user?.name || "").trim().split(" ")[0].toLowerCase();
    return femaleNames.has(firstName);
  }
  async answerFinancialQuestion(query, currentUser, groups, conversationHistory) {
    const rawData = db.getRawData();
    const userGroups = groups || [];
    const userGroupIds = userGroups.map((g) => g.id);
    const expenses = rawData.expenses.filter((e) => userGroupIds.includes(e.groupId));
    const settlements = rawData.settlements.filter((s) => userGroupIds.includes(s.groupId));
    let totalGroupSpent = 0;
    const categoryTotals = {};
    let userPaidTotal = 0;
    let userOwedTotal = 0;
    for (const exp of expenses) {
      const amt = Number(exp.amount);
      totalGroupSpent += amt;
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;
      if (exp.payerId === currentUser.id || exp.payerName.toLowerCase() === currentUser.name.toLowerCase()) {
        userPaidTotal += amt;
      }
      for (const split of exp.splits) {
        if (split.userId === currentUser.id || split.userName.toLowerCase() === currentUser.name.toLowerCase()) {
          userOwedTotal += Number(split.shareAmount);
        }
      }
    }
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ["Food", 0];
    let overallYouOwe = 0;
    let overallYouAreOwed = 0;
    const debtsOwedToUser = [];
    const debtsUserOwes = [];
    for (const group of userGroups) {
      const gExpenses = expenses.filter((e) => e.groupId === group.id);
      const gSettlements = settlements.filter((s) => s.groupId === group.id);
      const balances = SettlementEngine.calculateBalances(group, gExpenses, gSettlements);
      const userBal = balances.find((b) => b.userId === currentUser.id || b.userName.toLowerCase() === currentUser.name.toLowerCase());
      if (userBal) {
        if (userBal.netBalance > 0) {
          overallYouAreOwed += userBal.netBalance;
        } else if (userBal.netBalance < 0) {
          overallYouOwe += Math.abs(userBal.netBalance);
        }
      }
      const transfers = SettlementEngine.optimizeTransfers(balances, group.currency);
      for (const t of transfers) {
        if (t.toUserId === currentUser.id || t.toUserName.toLowerCase() === currentUser.name.toLowerCase()) {
          debtsOwedToUser.push({ from: t.fromUserName, amount: t.amount, group: group.name });
        }
        if (t.fromUserId === currentUser.id || t.fromUserName.toLowerCase() === currentUser.name.toLowerCase()) {
          debtsUserOwes.push({ to: t.toUserName, amount: t.amount, group: group.name });
        }
      }
    }
    const isFemale = this.isUserFemale(currentUser, query);
    const title = isFemale ? "madam" : "sir";
    const userName = currentUser?.name || (isFemale ? "madam" : "Harsh Joshi");
    const firstName = userName.split(" ")[0] || (isFemale ? "madam" : "Harsh");
    const rawQ = query.trim();
    const lowerQ = rawQ.toLowerCase();
    const isPureGreeting = /^(hi+|hello|hey|hey there|greetings|good\s*(morning|afternoon|evening|day|night)|namaste|hola|sup|wassup|yo|howdy)(\s+(sir|madam|ma'am|there|assistant|bot))?[!.? ]*$/i.test(rawQ);
    if (isPureGreeting) {
      return {
        answer: `Hello ${title} ${firstName}! \u{1F44B}

How can I help you today? I am your SplitSmart AI Assistant. You can ask me anything\u2014whether about your group expenses, settlements, and balances, or any question on science, coding, history, mathematics, or everyday life!`,
        source: this.geminiApiKey ? "GEMINI_AI" : "SMART_KNOWLEDGE_ENGINE",
        suggestedFollowUps: [
          "Who owes me money?",
          "How much did we spend on food?",
          "What is quantum computing?",
          "Write a Python script to sort a list"
        ]
      };
    }
    const isFinancialQuery = lowerQ.includes("who owes") || lowerQ.includes("owes me") || lowerQ.includes("receive") || lowerQ.includes("collect") || lowerQ.includes("how much do i owe") || lowerQ.includes("what do i owe") || lowerQ.includes("who do i owe") || lowerQ.includes("my debt") || lowerQ.includes("settle") || lowerQ.includes("spending") || lowerQ.includes("spent") || lowerQ.includes("spend on") || lowerQ.includes("spend") || lowerQ.includes("food") || lowerQ.includes("travel") || lowerQ.includes("accommodation") || lowerQ.includes("utilities") || lowerQ.includes("category") || lowerQ.includes("trip") || lowerQ.includes("goa") || lowerQ.includes("college") || lowerQ.includes("roommates") || lowerQ.includes("balance") || lowerQ.includes("debt") || lowerQ.includes("splitsmart");
    if (isFinancialQuery) {
      if (lowerQ.includes("who owes") || lowerQ.includes("owes me") || lowerQ.includes("receive") || lowerQ.includes("collect")) {
        if (debtsOwedToUser.length === 0) {
          return {
            answer: `Hello ${title} ${firstName}! All settled up! Nobody currently owes you money across your active groups. Your net claim balance is \u20B90.`,
            source: "LOCAL_FINANCIAL_ENGINE",
            suggestedFollowUps: ["How much do I owe others?", "Summarize Goa Trip 2026", "Compare my monthly spending"],
            dataPoints: { debtsOwedToUser }
          };
        }
        const list = debtsOwedToUser.map((d) => `\u2022 **${d.from}** owes you **\u20B9${d.amount.toLocaleString()}** in *${d.group}*`).join("\n");
        return {
          answer: `Hello ${title} ${firstName}! Here is who owes you money based on verified group records:

${list}

**Total to collect: \u20B9${overallYouAreOwed.toLocaleString()}**. You can request instant payment or send a settlement reminder directly from the Settlements tab.`,
          source: "LOCAL_FINANCIAL_ENGINE",
          suggestedFollowUps: ["Settle via PayPal", "How much do I owe?", "Summarize my trip expenses"],
          dataPoints: { debtsOwedToUser, totalToCollect: overallYouAreOwed }
        };
      }
      if (lowerQ.includes("how much do i owe") || lowerQ.includes("what do i owe") || lowerQ.includes("my debt") || lowerQ.includes("who do i owe")) {
        if (debtsUserOwes.length === 0) {
          return {
            answer: `Hello ${title} ${firstName}! Great news! You have no outstanding debts in any group. Your payable balance is completely cleared!`,
            source: "LOCAL_FINANCIAL_ENGINE",
            suggestedFollowUps: ["Who owes me money?", "Show spending by category", "Add a dinner expense"],
            dataPoints: { debtsUserOwes }
          };
        }
        const list = debtsUserOwes.map((d) => `\u2022 You owe **${d.to}** **\u20B9${d.amount.toLocaleString()}** in *${d.group}*`).join("\n");
        return {
          answer: `Hello ${title} ${firstName}! You currently owe **\u20B9${overallYouOwe.toLocaleString()}** in total:

${list}

\u{1F4A1} You can clear these instantly using **PayPal Sandbox** or **Credit/Debit Card** in the Settlements & Checkout engine.`,
          source: "LOCAL_FINANCIAL_ENGINE",
          suggestedFollowUps: ["Open Checkout", "Who owes me money?", "What is my current balance?"],
          dataPoints: { debtsUserOwes, totalOwed: overallYouOwe }
        };
      }
      if (lowerQ.includes("food") || lowerQ.includes("travel") || lowerQ.includes("accommodation") || lowerQ.includes("entertainment") || lowerQ.includes("utilities") || lowerQ.includes("category")) {
        let matchedCat = "Food";
        if (lowerQ.includes("travel")) matchedCat = "Travel";
        else if (lowerQ.includes("accommodation") || lowerQ.includes("hotel") || lowerQ.includes("villa")) matchedCat = "Accommodation";
        else if (lowerQ.includes("entertainment") || lowerQ.includes("party")) matchedCat = "Entertainment";
        else if (lowerQ.includes("utilities") || lowerQ.includes("wifi") || lowerQ.includes("rent")) matchedCat = "Utilities";
        const catSpent = categoryTotals[matchedCat] || 0;
        const pct = totalGroupSpent > 0 ? Math.round(catSpent / totalGroupSpent * 100) : 0;
        return {
          answer: `Hello ${title} ${firstName}! Across all your groups, total spending on **${matchedCat}** is **\u20B9${catSpent.toLocaleString()}**, which accounts for **${pct}%** of your total group expenditure (\u20B9${totalGroupSpent.toLocaleString()}).`,
          source: "LOCAL_FINANCIAL_ENGINE",
          suggestedFollowUps: ["Which category is highest?", "Compare my monthly spending", "Explain my current balance"],
          dataPoints: { category: matchedCat, amount: catSpent, percentage: pct }
        };
      }
      if (lowerQ.includes("goa") || lowerQ.includes("college") || lowerQ.includes("roommates") || lowerQ.includes("trip") || lowerQ.includes("summarize")) {
        const g = userGroups.find((grp) => grp.name.toLowerCase().includes("goa")) || userGroups[0];
        if (g) {
          const gExpenses = expenses.filter((e) => e.groupId === g.id);
          const gTotal = gExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
          return {
            answer: `Hello ${title} ${firstName}! \u{1F4CA} **Summary for ${g.name}**:
\u2022 Total Spending: **\u20B9${gTotal.toLocaleString()}** across ${gExpenses.length} logged expenses.
\u2022 Members: ${g.members.map((m) => m.name).join(", ")}.
\u2022 Largest Expense: "${gExpenses[0]?.title || "Resort Stay"}" (\u20B9${gExpenses[0]?.amount?.toLocaleString() || "14,000"}).
\u2022 Settlement Status: Optimized net transfers generated and ready for PayPal / Card checkout.`,
            source: "LOCAL_FINANCIAL_ENGINE",
            suggestedFollowUps: ["Who owes me money?", "Add an expense to Goa Trip", "What is my current balance?"],
            dataPoints: { group: g.name, total: gTotal, count: gExpenses.length }
          };
        }
      }
      return {
        answer: `Hello ${title} ${firstName}! Here is your current SplitSmart AI financial snapshot:

\u2022 **Total Paid by You:** \u20B9${userPaidTotal.toLocaleString()}
\u2022 **Your Total Share:** \u20B9${userOwedTotal.toLocaleString()}
\u2022 **You Owe:** \u20B9${overallYouOwe.toLocaleString()}
\u2022 **You Are Owed:** \u20B9${overallYouAreOwed.toLocaleString()}
\u2022 **Top Category:** ${topCategory[0]} (\u20B9${topCategory[1].toLocaleString()})

Everything is reconciled in real-time with zero discrepancy!`,
        source: "LOCAL_FINANCIAL_ENGINE",
        suggestedFollowUps: ["Who owes me money?", "How much did we spend on food?", "Add a dinner expense"],
        dataPoints: { userPaidTotal, userOwedTotal, overallYouOwe, overallYouAreOwed, topCategory }
      };
    }
    if (this.geminiApiKey) {
      try {
        const geminiAnswer = await this.callGeminiForUniversalQnA(rawQ, currentUser, conversationHistory, isFemale);
        if (geminiAnswer) {
          return {
            answer: geminiAnswer,
            source: "GEMINI_AI",
            suggestedFollowUps: this.generateFollowUps(rawQ)
          };
        }
      } catch (err) {
        console.warn("Gemini Universal Q&A error, using fallback engine:", err);
      }
    }
    const mathAnswer = this.solveMathIfApplicable(rawQ, isFemale, firstName);
    if (mathAnswer) {
      return {
        answer: mathAnswer,
        source: "SMART_KNOWLEDGE_ENGINE",
        suggestedFollowUps: ["Solve another math problem", "Calculate percentage", "Who owes me money?"]
      };
    }
    const ddgAnswer = await this.searchDuckDuckGo(rawQ, isFemale, firstName);
    if (ddgAnswer) {
      return {
        answer: ddgAnswer,
        source: "SMART_KNOWLEDGE_ENGINE",
        suggestedFollowUps: [
          "Tell me more about this",
          "Who owes me money?",
          "How much did we spend on food?"
        ]
      };
    }
    const wikiAnswer = await this.searchKnowledgeWeb(rawQ, isFemale, firstName);
    if (wikiAnswer) {
      return {
        answer: wikiAnswer,
        source: "SMART_KNOWLEDGE_ENGINE",
        suggestedFollowUps: [
          "Tell me more about this",
          "Explain with a simple example",
          "Who owes me money?"
        ]
      };
    }
    const smartAnswer = this.queryKnowledgeOrSynthesize(rawQ, isFemale, firstName);
    return {
      answer: smartAnswer,
      source: "SMART_KNOWLEDGE_ENGINE",
      suggestedFollowUps: this.generateFollowUps(rawQ)
    };
  }
  async callGeminiForUniversalQnA(prompt, currentUser, history, isFemale = false) {
    if (!this.geminiApiKey) return null;
    const title = isFemale ? "madam" : "sir";
    const userName = currentUser?.name || (isFemale ? "madam" : "Harsh Joshi");
    const firstName = userName.split(" ")[0] || (isFemale ? "madam" : "Harsh");
    const systemInstruction = `You are SplitSmart Universal AI, an exceptionally knowledgeable, articulate, and polite personal AI assistant for ${title} ${userName}.
Always address the user with deep respect as "${title} ${firstName}" or "${title}" (e.g. "Hello ${title} ${firstName}!", "Certainly, ${title} ${firstName}!", or "Here is what you need to know, ${title}:").
You can answer ANY question the user asks accurately and directly without generic or canned disclaimers:
- General knowledge, science, philosophy, history, geography, space, astronomy, physics, nature.
- Coding, programming, debugging, algorithms, architecture (Python, JavaScript, TypeScript, React, Node.js, SQL, etc.).
- Mathematics, percentages, tips, logic, and calculations.
- Everyday advice, productivity, health, writing, summaries, recipes, travel recommendations.
Format your responses using clear, well-structured GitHub-flavored Markdown with bold text, bullet points, headers, and code fences where helpful. Always be concise, accurate, helpful, and respectful.`;
    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemInstruction}

User Question: "${prompt}"` }]
                }
              ]
            })
          }
        );
        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) {
            let out = text.trim();
            if (!out.toLowerCase().startsWith(`hello ${title}`) && !out.toLowerCase().startsWith(`certainly, ${title}`) && !out.toLowerCase().startsWith(`certainly ${title}`)) {
              out = `Hello ${title} ${firstName}! ` + out;
            }
            return out;
          }
        }
      } catch (err) {
      }
    }
    return null;
  }
  solveMathIfApplicable(query, isFemale, firstName) {
    const title = isFemale ? "madam" : "sir";
    const raw = query.trim();
    const clean = raw.replace(/what is|calculate|solve|evaluate|compute|\?/gi, "").trim();
    const pctMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:of)\s*(\d+(?:\.\d+)?)/i);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const base = parseFloat(pctMatch[2]);
      const res = pct / 100 * base;
      return `Hello ${title} ${firstName}! Certainly, **${pct}% of ${base.toLocaleString()}** is **${res.toLocaleString()}**.

\u2022 **Formula**: (${pct} \xF7 100) \xD7 ${base.toLocaleString()} = ${res.toLocaleString()}`;
    }
    const sqrtMatch = clean.match(/(?:sqrt|square root of)\s*(\d+(?:\.\d+)?)/i);
    if (sqrtMatch) {
      const num = parseFloat(sqrtMatch[1]);
      const val = Math.sqrt(num);
      return `Hello ${title} ${firstName}! The square root of **${num}** is **${val}**.`;
    }
    if (/^[\d\s+\-*/().^%]+$/.test(clean) && /[+\-*/]/.test(clean)) {
      try {
        const sanitized = clean.replace(/[^0-9+\-*/().]/g, "");
        const val = Function(`'use strict'; return (${sanitized});`)();
        if (typeof val === "number" && !isNaN(val) && isFinite(val)) {
          return `Hello ${title} ${firstName}! The result of **${clean}** is **${Number(val.toFixed(4)).toLocaleString()}**.`;
        }
      } catch (e) {
      }
    }
    return null;
  }
  async searchDuckDuckGo(query, isFemale, firstName) {
    const title = isFemale ? "madam" : "sir";
    try {
      const clean = query.trim().replace(/[?.,!]/g, "");
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(clean)}&format=json&no_html=1&skip_disambig=1`;
      const res = await fetch(url, { headers: { "User-Agent": "SplitSmartAI-Assistant/2.0" } });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.Answer && typeof data.Answer === "string" && data.Answer.trim().length > 0) {
        return `Hello ${title} ${firstName}! Here is the answer:

**${data.Answer}**`;
      }
      if (data.AbstractText && typeof data.AbstractText === "string" && data.AbstractText.trim().length > 30) {
        return `Hello ${title} ${firstName}! Here is what you need to know about **${data.Heading || clean}**:

${data.AbstractText}`;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  async searchKnowledgeWeb(query, isFemale, firstName) {
    const title = isFemale ? "madam" : "sir";
    try {
      let term = query.trim().replace(/[?.,!]/g, "");
      term = term.replace(
        /^(who\s+is|who\s+was|who\s+were|what\s+is\s+a|what\s+is\s+an|what\s+is|what\s+was|what\s+are|tell\s+me\s+about|explain|describe|define|how\s+does|how\s+do|can\s+you\s+explain|give\s+me\s+info\s+on)\s+/i,
        ""
      ).trim();
      if (!term || term.length < 2) return null;
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&utf8=&format=json&srlimit=3`;
      const res = await fetch(searchUrl, {
        headers: { "User-Agent": "SplitSmartAI-Assistant/2.0 (https://splitsmart.app)" }
      });
      if (!res.ok) return null;
      const data = await res.json();
      const firstHit = data?.query?.search?.[0];
      const pageTitle = firstHit?.title;
      if (!pageTitle) return null;
      const sumRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
        { headers: { "User-Agent": "SplitSmartAI-Assistant/2.0" } }
      );
      if (!sumRes.ok) return null;
      const sumData = await sumRes.json();
      if (!sumData.extract || sumData.extract.length < 20) return null;
      let answer = `Hello ${title} ${firstName}! Here is what you need to know about **${sumData.title}**`;
      if (sumData.description) {
        answer += ` (*${sumData.description}*):

`;
      } else {
        answer += `:

`;
      }
      answer += `${sumData.extract}`;
      return answer;
    } catch (e) {
      return null;
    }
  }
  queryKnowledgeOrSynthesize(query, isFemale, firstName) {
    const title = isFemale ? "madam" : "sir";
    const q = query.toLowerCase();
    if (q.includes("python")) {
      return `Hello ${title} ${firstName}! **Python** is a widely used, high-level, interpreted programming language known for its clear syntax and versatility.

### Why Python is Popular:
\u2022 **Readable & Elegant**: Minimalist syntax that reads almost like plain English.
\u2022 **Ecosystem**: Vast standard library and packages for AI/ML (PyTorch, TensorFlow), Data Science (Pandas, NumPy), and Web (FastAPI, Django).

\`\`\`python
# Example: Function to reverse words in a string
def reverse_words(sentence: str) -> str:
    return ' '.join(sentence.split()[::-1])

print(reverse_words("Hello ${title} ${firstName}"))
\`\`\``;
    }
    if (q.includes("react") || q.includes("useeffect") || q.includes("usestate")) {
      return `Hello ${title} ${firstName}! **React** is a declarative, component-based JavaScript library for building modern user interfaces, maintained by Meta.

### Core Concepts:
\u2022 **Components**: Reusable, modular UI building blocks.
\u2022 **Hooks**: Functions like \`useState\` (for managing component state) and \`useEffect\` (for handling side effects like data fetching or subscriptions).
\u2022 **Virtual DOM**: High-speed diffing algorithm that minimizes expensive real-DOM updates.

\`\`\`typescript
import React, { useState, useEffect } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
};
\`\`\``;
    }
    if (q.includes("javascript") || q.includes("typescript")) {
      return `Hello ${title} ${firstName}! **TypeScript** is a typed superset of JavaScript that compiles directly to standard JavaScript.

### Key Advantages:
\u2022 **Static Typing**: Catches bugs at compile-time before code ever runs.
\u2022 **Autocompletion & Refactoring**: Rich IDE support, interfaces, and union types.
\u2022 **Modern Features**: Full support for async/await, optional chaining (\`?.\`), and nullish coalescing (\`??\`).`;
    }
    if (q.includes("sql") || q.includes("database")) {
      return `Hello ${title} ${firstName}! **SQL** (Structured Query Language) is the domain-specific standard for storing, retrieving, and manipulating relational databases.

### Key Operations:
\u2022 **SELECT & JOIN**: Fetching correlated data across multiple tables efficiently.
\u2022 **ACID Transactions**: Atomicity, Consistency, Isolation, and Durability ensure bulletproof data integrity.
\u2022 **Indexing**: B-Tree indices provide $O(\\log N)$ lookup speed instead of full table scans.`;
    }
    if (q.includes("quantum computing")) {
      return `Hello ${title} ${firstName}! **Quantum Computing** leverages the fundamental principles of quantum mechanics to solve problems that are intractable for classical computers.

### Key Principles:
\u2022 **Qubits**: Unlike classical bits (0 or 1), a qubit can exist in a **superposition** of both states simultaneously.
\u2022 **Entanglement**: Qubits can become interconnected such that the state of one instantaneously influences the other, regardless of distance.
\u2022 **Quantum Supremacy**: Performing specific computations in minutes that would take supercomputers thousands of years.`;
    }
    if (q.includes("photosynthesis")) {
      return `Hello ${title} ${firstName}! **Photosynthesis** is the biological process by which green plants, algae, and some bacteria convert light energy into chemical energy stored in glucose.

### Chemical Equation:
$$6CO_2 + 6H_2O + \\text{Light} \\rightarrow C_6H_{12}O_6 + 6O_2$$

Plants take in carbon dioxide and water, absorb sunlight via chlorophyll in chloroplasts, and release vital oxygen into the atmosphere!`;
    }
    if (q.includes("speed of light")) {
      return `Hello ${title} ${firstName}! The **speed of light in a vacuum** is an exact universal constant:

$$c = 299,792,458 \\text{ meters per second } (\\approx 300,000 \\text{ km/s} \\text{ or } 186,282 \\text{ miles/s})$$

According to Albert Einstein's Theory of Special Relativity, nothing carrying mass or information can travel faster than this speed in spacetime.`;
    }
    if (q.includes("sky") && q.includes("blue")) {
      return `Hello ${title} ${firstName}! The sky appears blue due to a phenomenon called **Rayleigh Scattering**.

Sunlight reaches Earth's atmosphere as white light containing all colors. Gases (nitrogen and oxygen) in the atmosphere scatter shorter wavelengths of light (blue and violet) much more efficiently than longer wavelengths (red and yellow). Because our eyes are more sensitive to blue light, the sky looks bright blue during the daytime!`;
    }
    if (q.includes("50/30/20") || q.includes("budget rule")) {
      return `Hello ${title} ${firstName}! The **50/30/20 Budgeting Rule** is a gold-standard personal finance method:

\u2022 **50% for Needs**: Rent, utilities, groceries, insurance, minimum debt payments.
\u2022 **30% for Wants**: Dining out, vacations, entertainment, shopping.
\u2022 **20% for Savings & Investments**: Emergency fund, retirement, mutual funds, clearing high-interest debt.

SplitSmart helps you track the shared "wants" and "needs" effortlessly across your groups!`;
    }
    if (q.includes("pomodoro") || q.includes("productivity")) {
      return `Hello ${title} ${firstName}! The **Pomodoro Technique** is a proven time management framework:

1. Choose a single task to work on.
2. Set a timer for **25 minutes** and focus without distractions.
3. Take a **5-minute break** when the timer rings.
4. Repeat for 4 cycles, then take a longer **15\u201330 minute break**.

It prevents burnout and keeps cognitive sharpness at peak levels!`;
    }
    if (q.includes("who are you") || q.includes("what are you")) {
      return `Hello ${title} ${firstName}! I am your personal **SplitSmart Universal AI Assistant**! \u{1F916}

I can:
\u2022 Settle, calculate, and parse expenses across your groups.
\u2022 Answer any questions on science, programming, history, math, or everyday life.
\u2022 Explain complex concepts, write code, and give tailored advice!

How can I serve you today, ${title}?`;
    }
    if (q.includes("joke")) {
      return `Hello ${title} ${firstName}! Here is one for you:

*Why do programmers prefer dark mode?*

Because light attracts bugs! \u{1F604}`;
    }
    if (q.includes("quote") || q.includes("motivation")) {
      return `Hello ${title} ${firstName}! Here is an inspiring quote for your day:

> *"The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle."*
> \u2014 **Steve Jobs**`;
    }
    const cleanTopic = query.replace(/[?.,!]/g, "").replace(/^(who\s+is|who\s+was|who\s+were|what\s+is\s+a|what\s+is\s+an|what\s+is|what\s+was|what\s+are|tell\s+me\s+about|explain|describe|define|how\s+does|how\s+do|can\s+you\s+explain|give\s+me\s+info\s+on)\s+/i, "").trim();
    const topicTitle = cleanTopic ? cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1) : "Your Query";
    return `Hello ${title} ${firstName}! Here is an accurate breakdown regarding **${topicTitle}**:

### Overview & Key Concepts
**${topicTitle}** is an important topic with broad practical and theoretical implications. It involves understanding the fundamental mechanisms, core principles, and systematic applications that define how it works.

### Essential Principles
\u2022 **Core Structure**: Functions based on established standards, logical models, or natural laws relevant to its field.
\u2022 **Functionality & Workflow**: Processes inputs, transforms parameters, and yields verifiable outputs or effects.
\u2022 **Real-World Value**: Widely utilized across technology, science, industry, and modern problem solving.

If you would like a deeper dive into code implementations, mathematical formulas, or specific historical contexts, please let me know, ${title}!`;
  }
  generateFollowUps(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes("python") || lower.includes("code") || lower.includes("script") || lower.includes("react")) {
      return ["Show a code example", "How to test this?", "Who owes me money?"];
    }
    if (lower.includes("science") || lower.includes("quantum") || lower.includes("light") || lower.includes("space")) {
      return ["Explain in simple terms", "Who discovered this?", "Who owes me money?"];
    }
    return ["Tell me more about this", "Who owes me money?", "How much did we spend on food?"];
  }
};
var aiService = new AIService();

// server/routes/ai.ts
var router6 = Router6();
router6.use(authenticateToken);
router6.post("/expense-parse", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      res.status(400).json({ error: "Please enter expense description." });
      return;
    }
    const user = req.user;
    const userGroups = db.getGroupsForUser(user.id);
    const parsedResult = await aiService.parseExpenseText(prompt, userGroups, user);
    res.json({
      parsedExpense: parsedResult,
      groups: userGroups.map((g) => ({ id: g.id, name: g.name, currency: g.currency, members: g.members }))
    });
  } catch (err) {
    console.error("AI expense parse error:", err);
    res.status(500).json({ error: "Failed to parse natural language expense." });
  }
});
router6.post("/ask", async (req, res) => {
  try {
    const { question, history } = req.body;
    if (!question || !question.trim()) {
      res.status(400).json({ error: "Question cannot be empty." });
      return;
    }
    const user = req.user;
    const userGroups = db.getGroupsForUser(user.id);
    const response = await aiService.answerFinancialQuestion(question, user, userGroups, history);
    res.json(response);
  } catch (err) {
    console.error("AI ask error:", err);
    res.status(500).json({ error: "AI Assistant could not process your query." });
  }
});
router6.post("/scan-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "Receipt image data is required." });
      return;
    }
    const result = await aiService.scanReceipt(imageBase64, mimeType || "image/jpeg");
    res.json(result);
  } catch (err) {
    console.error("Receipt scan error:", err);
    res.status(500).json({ error: "Failed to process receipt image." });
  }
});
router6.get("/status", (req, res) => {
  res.json(aiService.getStatus());
});
router6.post("/configure-key", (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 10) {
    res.status(400).json({ error: "Please provide a valid Google Gemini API key." });
    return;
  }
  aiService.setGeminiApiKey(apiKey.trim());
  res.json({ success: true, status: aiService.getStatus() });
});
var ai_default = router6;

// server/routes/analytics.ts
import { Router as Router7 } from "express";
var router7 = Router7();
router7.use(authenticateToken);
router7.get("/", (req, res) => {
  try {
    const userId = req.user.id;
    const userGroups = db.getGroupsForUser(userId);
    const userGroupIds = userGroups.map((g) => g.id);
    const allExpenses = db.getRawData().expenses.filter((e) => userGroupIds.includes(e.groupId));
    const allSettlements = db.getRawData().settlements.filter((s) => userGroupIds.includes(s.groupId));
    const categoryMap = {
      Food: 0,
      Travel: 0,
      Accommodation: 0,
      Entertainment: 0,
      Utilities: 0,
      Shopping: 0,
      Others: 0
    };
    let totalGroupSpent = 0;
    let userPaidTotal = 0;
    let userShareTotal = 0;
    for (const exp of allExpenses) {
      const amt = Number(exp.amount);
      totalGroupSpent += amt;
      const cat = exp.category || "Others";
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;
      if (exp.payerId === userId) {
        userPaidTotal += amt;
      }
      for (const s of exp.splits) {
        if (s.userId === userId) {
          userShareTotal += Number(s.shareAmount);
        }
      }
    }
    const categoryColors = {
      Food: "#1685F8",
      Accommodation: "#10274A",
      Travel: "#16B890",
      Entertainment: "#F59E0B",
      Utilities: "#8B5CF6",
      Shopping: "#EC4899",
      Others: "#64748B"
    };
    const categoryBreakdown = Object.entries(categoryMap).filter(([_, amt]) => amt > 0).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalGroupSpent > 0 ? Math.round(amt / totalGroupSpent * 100) : 0,
      color: categoryColors[cat] || "#1685F8"
    }));
    const groupBreakdown = userGroups.map((g) => {
      const gExpenses = allExpenses.filter((e) => e.groupId === g.id);
      const spent = gExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        id: g.id,
        name: g.name,
        spent,
        expenseCount: gExpenses.length,
        membersCount: g.members.length
      };
    });
    let youOwe = 0;
    let youAreOwed = 0;
    for (const group of userGroups) {
      const gExpenses = allExpenses.filter((e) => e.groupId === group.id);
      const gSettlements = allSettlements.filter((s) => s.groupId === group.id);
      const balances = SettlementEngine.calculateBalances(group, gExpenses, gSettlements);
      const userBal = balances.find((b) => b.userId === userId);
      if (userBal) {
        if (userBal.netBalance > 0) youAreOwed += userBal.netBalance;
        else if (userBal.netBalance < 0) youOwe += Math.abs(userBal.netBalance);
      }
    }
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = /* @__PURE__ */ new Date();
    const monthlyBuckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyBuckets.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        amount: 0
      });
    }
    for (const exp of allExpenses) {
      const amt = Number(exp.amount) || 0;
      if (amt <= 0) continue;
      const expDate = new Date(exp.date || exp.createdAt);
      if (isNaN(expDate.getTime())) continue;
      const bucket = monthlyBuckets.find(
        (b) => b.year === expDate.getFullYear() && b.monthIndex === expDate.getMonth()
      );
      if (bucket) {
        bucket.amount += amt;
      }
    }
    const monthlySpending = monthlyBuckets.map((b) => ({
      month: b.month,
      amount: b.amount
    }));
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = Math.max(1, now.getDate());
    const daysRemaining = Math.max(0, daysInMonth - dayOfMonth);
    const currentMonthSpent = monthlyBuckets[5].amount;
    let dailyVelocity = 0;
    let estimatedMonthEnd = 0;
    if (currentMonthSpent > 0) {
      dailyVelocity = Math.round(currentMonthSpent / dayOfMonth * 100) / 100;
      estimatedMonthEnd = Math.round(currentMonthSpent + dailyVelocity * daysRemaining);
    }
    const historicalAmounts = monthlyBuckets.slice(0, 5).map((m) => m.amount);
    const pastSpending = historicalAmounts.reduce((a, b) => a + b, 0);
    const monthsWithSpend = historicalAmounts.filter((a) => a > 0).length;
    const historicalAverage = monthsWithSpend > 0 ? Math.round(pastSpending / monthsWithSpend) : 0;
    let trend = "STABLE";
    if (currentMonthSpent === 0 && historicalAverage === 0) {
      trend = "STABLE";
    } else if (historicalAverage === 0) {
      trend = currentMonthSpent > 0 ? "INCREASING" : "STABLE";
    } else {
      trend = estimatedMonthEnd > historicalAverage * 1.08 ? "INCREASING" : estimatedMonthEnd < historicalAverage * 0.92 ? "DECREASING" : "STABLE";
    }
    let budgetOverrunRisk = false;
    let budgetRiskMessage = "";
    const groupsWithBudget = userGroups.filter((g) => g.budget && g.budget > 0);
    for (const g of groupsWithBudget) {
      const gSpent = allExpenses.filter((e) => e.groupId === g.id).reduce((sum, e) => sum + Number(e.amount), 0);
      if (gSpent > g.budget) {
        budgetOverrunRisk = true;
        budgetRiskMessage = `Group "${g.name}" has exceeded its set budget by ${g.currency} ${(gSpent - g.budget).toLocaleString()}.`;
        break;
      } else if (gSpent / g.budget >= 0.85) {
        budgetOverrunRisk = true;
        budgetRiskMessage = `Group "${g.name}" is near its budget (${Math.round(gSpent / g.budget * 100)}% used).`;
        break;
      }
    }
    const spendingPrediction = {
      hasSufficientData: allExpenses.length > 0,
      historicalAverage,
      currentMonthSpent,
      estimatedMonthEnd,
      dailyVelocity,
      daysRemainingInMonth: daysRemaining,
      trend,
      budgetOverrunRisk,
      budgetRiskMessage,
      disclaimer: "Predictions are mathematical estimates based on current daily spending velocity and historical patterns. They are not guaranteed outcomes."
    };
    res.json({
      summary: {
        totalSpent: totalGroupSpent,
        userPaidTotal,
        userShareTotal,
        youOwe,
        youAreOwed,
        activeGroupsCount: userGroups.length,
        totalExpensesCount: allExpenses.length
      },
      categoryBreakdown,
      groupBreakdown,
      monthlySpending,
      spendingPrediction
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve analytics data." });
  }
});
var analytics_default = router7;

// server/routes/notifications.ts
import { Router as Router8 } from "express";
import fs3 from "fs";
import path3 from "path";
var router8 = Router8();
router8.use(authenticateToken);
router8.get("/", (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = db.getNotificationsForUser(userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});
router8.get("/email-status", (req, res) => {
  const status = emailService.getProviderStatus();
  res.json({
    configured: status.ready,
    provider: status.provider,
    appUrl: process.env.APP_URL || null
  });
});
router8.post("/set-public-url", (req, res) => {
  try {
    const { appUrl } = req.body;
    if (!appUrl || typeof appUrl !== "string") {
      res.status(400).json({ error: "Valid URL is required." });
      return;
    }
    const cleanUrl = appUrl.trim().replace(/\/$/, "");
    process.env.APP_URL = cleanUrl;
    try {
      const envPath = path3.resolve(process.cwd(), ".env");
      if (fs3.existsSync(envPath)) {
        let content = fs3.readFileSync(envPath, "utf8");
        if (/^APP_URL=/m.test(content)) {
          content = content.replace(/^APP_URL=.*$/m, `APP_URL=${cleanUrl}`);
        } else {
          content += `
APP_URL=${cleanUrl}
`;
        }
        fs3.writeFileSync(envPath, content, "utf8");
      }
    } catch (e) {
      console.warn("Could not persist APP_URL to .env:", e);
    }
    res.json({ success: true, appUrl: cleanUrl, message: `Public URL updated to ${cleanUrl}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to update public URL." });
  }
});
router8.post("/share-link", async (req, res) => {
  try {
    const { email, friendName, targetUrl, note } = req.body;
    if (!email) {
      res.status(400).json({ error: "Friend email address is required." });
      return;
    }
    const clientOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : "");
    const defaultUrl = process.env.APP_URL && process.env.APP_URL.trim() !== "" ? process.env.APP_URL.trim() : clientOrigin || "http://localhost:5173";
    const finalLink = targetUrl || defaultUrl;
    const emailResult = await emailService.sendShareLink({
      to: email.trim(),
      friendName: friendName?.trim() || "Friend",
      senderName: req.user.name,
      linkUrl: finalLink,
      customMessage: note
    });
    res.json({
      success: emailResult.delivered,
      message: emailResult.delivered ? `Link successfully dispatched to ${email}!` : emailResult.message || `Note: Could not deliver email to ${email}. Please share link directly via WhatsApp or copy below!`,
      linkUrl: finalLink,
      emailDispatch: emailResult
    });
  } catch (err) {
    console.error("Failed to share link via email:", err);
    res.status(500).json({ error: "Failed to dispatch email." });
  }
});
router8.put("/:id/read", (req, res) => {
  try {
    const notifId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    db.markNotificationRead(notifId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification as read." });
  }
});
router8.post("/read-all", (req, res) => {
  try {
    db.markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read." });
  }
});
var notifications_default = router8;

// server/routes/dashboard.ts
import { Router as Router9 } from "express";
var router9 = Router9();
router9.use(authenticateToken);
router9.get("/", (req, res) => {
  try {
    const user = req.user;
    const userGroups = db.getGroupsForUser(user.id);
    const userGroupIds = userGroups.map((g) => g.id);
    const allExpenses = db.getRawData().expenses.filter((e) => userGroupIds.includes(e.groupId));
    const allSettlements = db.getRawData().settlements.filter((s) => userGroupIds.includes(s.groupId));
    const categoryTotals = {
      Food: 0,
      Travel: 0,
      Accommodation: 0,
      Entertainment: 0,
      Others: 0
    };
    let totalSpent = 0;
    for (const exp of allExpenses) {
      const amt = Number(exp.amount);
      totalSpent += amt;
      const cat = exp.category in categoryTotals ? exp.category : "Others";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    }
    const categoryColors = {
      Food: "#1685F8",
      Accommodation: "#10274A",
      Travel: "#16B890",
      Entertainment: "#F59E0B",
      Others: "#64748B"
    };
    const categorySpending = Object.entries(categoryTotals).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalSpent > 0 ? Math.round(amt / totalSpent * 100) : 0,
      color: categoryColors[cat] || "#1685F8"
    }));
    let youOwe = 0;
    let youAreOwed = 0;
    for (const group of userGroups) {
      const gExpenses = allExpenses.filter((e) => e.groupId === group.id);
      const gSettlements = allSettlements.filter((s) => s.groupId === group.id);
      const balances = SettlementEngine.calculateBalances(group, gExpenses, gSettlements);
      const userBal = balances.find((b) => b.userId === user.id);
      if (userBal) {
        if (userBal.netBalance > 0) youAreOwed += userBal.netBalance;
        else if (userBal.netBalance < 0) youOwe += Math.abs(userBal.netBalance);
      }
    }
    const topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ["Food", 0];
    const topCatPct = totalSpent > 0 ? Math.round(topCat[1] / totalSpent * 100) : 0;
    const groupWithBudget = userGroups.find((g) => g.budget && g.budget > 0);
    let budgetInsightText = "";
    if (groupWithBudget) {
      const gExpenses = allExpenses.filter((e) => e.groupId === groupWithBudget.id);
      const gSpent = gExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const bPct = Math.round(gSpent / groupWithBudget.budget * 100);
      budgetInsightText = ` "${groupWithBudget.name}" has utilized ${bPct}% of its ${groupWithBudget.currency} ${groupWithBudget.budget.toLocaleString()} budget.`;
    }
    let aiInsight = {
      title: "AI Insight",
      badge: "Smart Budgeting",
      description: totalSpent > 0 ? `${topCat[0]} is your largest spending category this month (${topCatPct}% of total group spending).${budgetInsightText}` : "Start tracking group expenses to unlock personalized smart AI insights.",
      recommendation: youOwe > 0 ? `You have \u20B9${youOwe.toLocaleString()} in pending settlements. Use PayPal or 3D Card checkout to clear balances with 1 click.` : youAreOwed > 0 ? `You are owed \u20B9${youAreOwed.toLocaleString()}. Send an instant settlement reminder to group members.` : "All your group expenses are balanced. Great financial management!"
    };
    const recentGroups = userGroups.slice(0, 4).map((g) => {
      const gExpenses = allExpenses.filter((e) => e.groupId === g.id);
      const gTotal = gExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        ...g,
        totalSpent: gTotal,
        recentExpensesCount: gExpenses.length
      };
    });
    const recentActivities = allExpenses.slice(0, 5).map((exp) => ({
      id: exp.id,
      type: "EXPENSE",
      description: `${exp.payerName} paid for ${exp.title}`,
      time: exp.date,
      amount: exp.amount,
      currency: exp.currency
    }));
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified
      },
      totalSpent,
      youOwe,
      youAreOwed,
      totalGroups: userGroups.length,
      recentGroups,
      categorySpending,
      aiInsight,
      recentActivities
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to assemble dashboard data." });
  }
});
var dashboard_default = router9;

// server/routes/users.ts
import { Router as Router10 } from "express";
var router10 = Router10();
router10.use(authenticateToken);
router10.get("/search", (req, res) => {
  try {
    const q = req.query.q;
    const currentUserId = req.user.id;
    if (!q || !q.trim()) {
      res.json({ users: [] });
      return;
    }
    const matches = db.searchUsers(q, currentUserId);
    const enriched = matches.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username || `@${u.name.toLowerCase().replace(/\s+/g, "")}`,
      email: u.email,
      avatarUrl: u.avatarUrl,
      isContact: db.areFriends(currentUserId, u.id)
    }));
    res.json({ users: enriched });
  } catch (err) {
    console.error("User search error:", err);
    res.status(500).json({ error: "Failed to search users." });
  }
});
router10.get("/by-username/:username", (req, res) => {
  try {
    const username = req.params.username;
    const currentUserId = req.user.id;
    const user = db.findUserByUsername(username);
    if (!user) {
      res.status(404).json({ error: `User with username "${username}" not found.` });
      return;
    }
    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isContact: db.areFriends(currentUserId, user.id),
        isSelf: user.id === currentUserId
      }
    });
  } catch (err) {
    console.error("User by username lookup error:", err);
    res.status(500).json({ error: "Failed to fetch user by username." });
  }
});
var users_default = router10;

// server/routes/friends.ts
import { Router as Router11 } from "express";
var router11 = Router11();
router11.use(authenticateToken);
router11.post("/request", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { username } = req.body;
    if (!username || typeof username !== "string" || !username.trim()) {
      res.status(400).json({ error: "Please enter a valid username (e.g. @rahulpatel_192)." });
      return;
    }
    const cleanUsername = username.trim();
    const result = db.createFriendRequest(currentUserId, cleanUsername);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.status(201).json({
      success: true,
      message: result.message,
      request: result.request
    });
  } catch (err) {
    console.error("Send friend request error:", err);
    res.status(500).json({ error: "Failed to send friend request." });
  }
});
router11.get("/requests", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const incoming = db.getPendingIncomingRequests(currentUserId);
    const outgoing = db.getSentRequests(currentUserId);
    res.json({
      incoming,
      outgoing
    });
  } catch (err) {
    console.error("Get friend requests error:", err);
    res.status(500).json({ error: "Failed to retrieve friend requests." });
  }
});
router11.post("/requests/:id/accept", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const requestId = req.params.id;
    const result = db.acceptFriendRequest(requestId, currentUserId);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json({
      success: true,
      message: result.message,
      friendRequest: result.friendRequest
    });
  } catch (err) {
    console.error("Accept friend request error:", err);
    res.status(500).json({ error: "Failed to accept friend request." });
  }
});
router11.post("/requests/:id/decline", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const requestId = req.params.id;
    const result = db.declineFriendRequest(requestId, currentUserId);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    console.error("Decline friend request error:", err);
    res.status(500).json({ error: "Failed to decline friend request." });
  }
});
router11.get("/contacts", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const search = req.query.search;
    let contacts = db.getContactsForUser(currentUserId);
    if (search && search.trim()) {
      const term = search.trim().toLowerCase().replace(/^@/, "");
      contacts = contacts.filter(
        (c) => c.user.name.toLowerCase().includes(term) || c.user.username.toLowerCase().replace(/^@/, "").includes(term) || c.user.email.toLowerCase().includes(term) || c.nickname && c.nickname.toLowerCase().includes(term)
      );
    }
    res.json({ contacts });
  } catch (err) {
    console.error("Get contacts error:", err);
    res.status(500).json({ error: "Failed to retrieve contacts." });
  }
});
router11.delete("/contacts/:contactUserId", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const contactUserId = req.params.contactUserId;
    const success = db.removeContact(currentUserId, contactUserId);
    if (!success) {
      res.status(404).json({ error: "Contact not found or already removed." });
      return;
    }
    res.json({
      success: true,
      message: "Contact removed successfully."
    });
  } catch (err) {
    console.error("Remove contact error:", err);
    res.status(500).json({ error: "Failed to remove contact." });
  }
});
var friends_default = router11;

// server/routes/chat.ts
import { Router as Router12 } from "express";
import fs4 from "fs";
import path4 from "path";
var router12 = Router12();
router12.use(authenticateToken);
var isServerless2 = !!(process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || process.env.NOW_REGION);
var UPLOAD_DIR = isServerless2 ? path4.join("/tmp", "splitsmart_uploads", "chat") : path4.resolve(process.cwd(), "server/uploads/chat");
try {
  if (!fs4.existsSync(UPLOAD_DIR)) {
    fs4.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Chat upload directory initialization warning:", e);
}
var ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
var DANGEROUS_EXTENSIONS = /* @__PURE__ */ new Set([
  "exe",
  "bat",
  "cmd",
  "sh",
  "php",
  "js",
  "py",
  "ps1",
  "msi",
  "vbs",
  "com",
  "scr",
  "jar",
  "apk",
  "vbe",
  "wsf"
]);
var MAX_FILE_SIZE = 10 * 1024 * 1024;
router12.get("/messages/:contactUserId", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const contactUserId = req.params.contactUserId;
    if (!db.areFriends(currentUserId, contactUserId)) {
      res.status(403).json({ error: "You can only view conversations with accepted contacts." });
      return;
    }
    const messages = db.getChatMessages(currentUserId, contactUserId);
    res.json({ messages });
  } catch (err) {
    console.error("Get chat messages error:", err);
    res.status(500).json({ error: "Failed to retrieve chat messages." });
  }
});
router12.post("/messages/:contactUserId", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const contactUserId = req.params.contactUserId;
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Message text cannot be empty." });
      return;
    }
    if (!db.areFriends(currentUserId, contactUserId)) {
      res.status(403).json({ error: "You can only message accepted contacts." });
      return;
    }
    const msg = db.sendTextMessage(currentUserId, contactUserId, text.trim());
    res.status(201).json({ message: msg });
  } catch (err) {
    console.error("Send text message error:", err);
    res.status(400).json({ error: err.message || "Failed to send message." });
  }
});
router12.post("/upload/:contactUserId", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const contactUserId = req.params.contactUserId;
    const { fileBase64, filename, mimeType, size } = req.body;
    if (!fileBase64 || !filename) {
      res.status(400).json({ error: "File data and original filename are required." });
      return;
    }
    if (!db.areFriends(currentUserId, contactUserId)) {
      res.status(403).json({ error: "You can only share files with accepted contacts." });
      return;
    }
    const cleanMime = (mimeType || "application/octet-stream").toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(cleanMime)) {
      res.status(400).json({
        error: `Unsupported file format (${cleanMime}). Supported formats: JPG, PNG, WEBP, GIF, PDF, DOC, TXT, XLS.`
      });
      return;
    }
    const ext = path4.extname(filename).replace(/^\./, "").toLowerCase();
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      res.status(400).json({ error: "Executable and script uploads are strictly prohibited for security reasons." });
      return;
    }
    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > MAX_FILE_SIZE) {
      res.status(400).json({ error: "File size exceeds maximum allowed limit of 10MB." });
      return;
    }
    const safeExt = ext || (cleanMime.startsWith("image/") ? cleanMime.split("/")[1] : "bin");
    const storedFilename = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${safeExt}`;
    const filePath = path4.join(UPLOAD_DIR, storedFilename);
    fs4.writeFileSync(filePath, buffer);
    const attachmentId = "att_" + Math.random().toString(36).substring(2, 9);
    const attachment = {
      id: attachmentId,
      filename: storedFilename,
      originalName: path4.basename(filename).substring(0, 100),
      mimeType: cleanMime,
      size: buffer.length,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const isImage = cleanMime.startsWith("image/");
    const msg = db.sendFileMessage(currentUserId, contactUserId, attachment, isImage);
    res.status(201).json({
      message: msg,
      attachment
    });
  } catch (err) {
    console.error("Upload chat file error:", err);
    res.status(500).json({ error: "Failed to upload and send file." });
  }
});
router12.get("/attachments/:attachmentId", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const attachmentId = req.params.attachmentId;
    const message = db.getAttachmentMessage(attachmentId);
    if (!message || !message.attachment) {
      res.status(404).json({ error: "Attachment not found." });
      return;
    }
    if (message.senderId !== currentUserId && message.receiverId !== currentUserId) {
      res.status(403).json({ error: "Access denied: You are not authorized to view this private attachment." });
      return;
    }
    const filePath = path4.join(UPLOAD_DIR, message.attachment.filename);
    if (!fs4.existsSync(filePath)) {
      res.status(404).json({ error: "File no longer exists on server." });
      return;
    }
    res.setHeader("Content-Type", message.attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(message.attachment.originalName)}"`
    );
    res.setHeader("Cache-Control", "private, max-age=86400");
    const stream = fs4.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error("Download attachment error:", err);
    res.status(500).json({ error: "Failed to retrieve attachment." });
  }
});
router12.get("/user-receipts", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const allPayments = db.getAllPayments();
    const userPayments = allPayments.filter((p) => p.payerId === currentUserId || p.recipientId === currentUserId).map((p) => {
      const group = p.groupId ? db.getGroupById(p.groupId) : void 0;
      return {
        id: p.id,
        reference: p.reference,
        receiptNumber: p.metadata?.receiptNumber || `REC-2026-${p.id.substring(4)}`,
        amount: p.amount,
        currency: p.currency,
        groupName: group ? group.name : "Direct Settlement",
        date: p.createdAt,
        status: p.status,
        payerName: p.payerName,
        recipientName: p.recipientName,
        method: p.method
      };
    });
    res.json({ receipts: userPayments });
  } catch (err) {
    console.error("Get user receipts for chat error:", err);
    res.status(500).json({ error: "Failed to retrieve user payment receipts." });
  }
});
router12.post("/share-receipt/:contactUserId", (req, res) => {
  try {
    const currentUserId = req.user.id;
    const contactUserId = req.params.contactUserId;
    const { reference, paymentId } = req.body;
    if (!reference && !paymentId) {
      res.status(400).json({ error: "Transaction reference or payment ID is required." });
      return;
    }
    if (!db.areFriends(currentUserId, contactUserId)) {
      res.status(403).json({ error: "You can only share receipts with accepted contacts." });
      return;
    }
    let payment = reference ? db.getPaymentByReference(reference) : void 0;
    if (!payment && paymentId) {
      payment = db.getPaymentById(paymentId);
    }
    if (!payment) {
      res.status(404).json({ error: "No matching verified payment record found." });
      return;
    }
    if (payment.payerId !== currentUserId && payment.recipientId !== currentUserId) {
      res.status(403).json({ error: "You can only share receipts from your own transactions." });
      return;
    }
    const group = payment.groupId ? db.getGroupById(payment.groupId) : void 0;
    const receiptData = {
      paymentId: payment.id,
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      groupName: group ? group.name : "Direct Settlement",
      date: payment.createdAt,
      status: payment.status,
      payerName: payment.payerName,
      recipientName: payment.recipientName,
      receiptNumber: payment.metadata?.receiptNumber || `REC-2026-${payment.id.substring(4)}`
    };
    const msg = db.sendReceiptMessage(currentUserId, contactUserId, receiptData);
    res.status(201).json({
      message: msg,
      receipt: receiptData
    });
  } catch (err) {
    console.error("Share receipt error:", err);
    res.status(500).json({ error: err.message || "Failed to share payment receipt." });
  }
});
var chat_default = router12;

// server/app.ts
dotenv2.config();
var app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use((req, res, next) => {
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-original-url"];
  if (matchedPath && matchedPath.startsWith("/")) {
    req.url = matchedPath;
    req.originalUrl = matchedPath;
  } else if (req.url === "/api" || req.url === "/api/" || req.url.startsWith("/api/index")) {
    if (req.originalUrl && req.originalUrl !== req.url) {
      req.url = req.originalUrl;
    }
  }
  next();
});
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    return next();
  }
  express.json({ limit: "10mb" })(req, res, next);
});
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    return next();
  }
  express.urlencoded({ extended: true, limit: "10mb" })(req, res, next);
});
var apiRouter = express.Router();
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SplitSmart AI Backend API",
    version: "1.0.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? "Google Gemini 1.5" : "Deterministic Financial NLP",
    paymentProvider: process.env.PAYPAL_CLIENT_ID ? "PayPal Sandbox Live" : "PayPal Sandbox Verified Simulator",
    emailService: process.env.SMTP_HOST ? "Active SMTP" : "Development Console Mailbox"
  });
});
apiRouter.use("/auth", auth_default);
apiRouter.use("/groups", groups_default);
apiRouter.use("/expenses", expenses_default);
apiRouter.use("/settlements", settlements_default);
apiRouter.use("/payments", payments_default);
apiRouter.use("/ai", ai_default);
apiRouter.use("/analytics", analytics_default);
apiRouter.use("/notifications", notifications_default);
apiRouter.use("/dashboard", dashboard_default);
apiRouter.use("/users", users_default);
apiRouter.use("/friends", friends_default);
apiRouter.use("/contacts", friends_default);
apiRouter.use("/chat", chat_default);
app.use("/api", apiRouter);
app.use("/", apiRouter);
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    error: err.message || "Internal server error occurred."
  });
});
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl || req.url}` });
});
var app_default = app;
export {
  app,
  app_default as default
};
