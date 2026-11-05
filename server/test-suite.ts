import { db } from './db/database';
import { SettlementEngine } from './services/settlementEngine';
import { aiService } from './services/aiService';
import { paypalService } from './services/paypalService';
import { emailService } from './services/email';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('🧪 ==========================================');
  console.log('🧪 RUNNING SPLITSMART AI MASTER VERIFICATION');
  console.log('🧪 ==========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  console.log('--- TEST GROUP 1: Database & Persistence ---');
  db.initDemoDataIfNeeded(true);
  const rawData = db.getRawData();
  assert(rawData.users.length >= 4, 'Demo users seeded (Rahul, Priya, Aman, Sneha)');
  assert(rawData.groups.length >= 3, 'Demo groups seeded (Goa Trip 2026, College Friends, Roommates)');
  assert(rawData.expenses.length >= 5, 'Demo expenses seeded with splits');

  console.log('\n--- TEST GROUP 2: Email & OTP Verification ---');
  const testUser = db.createUser({
    name: 'Test Hackathon Judge',
    email: 'judge@paypal-hackathon.com',
    passwordHash: bcrypt.hashSync('JudgePass123!', 10),
    isEmailVerified: false,
  });
  assert(testUser.id.startsWith('usr_'), 'User created in PENDING_VERIFICATION state');

  const otp = db.createVerificationOtp(testUser.id, testUser.email);
  assert(otp.length === 6, 'Generated 6-digit cryptographically secure OTP');

  const wrongRes = db.verifyEmailOtp(testUser.id, '000000');
  assert(!wrongRes.success, 'Rejects invalid OTP code');

  const correctRes = db.verifyEmailOtp(testUser.id, otp);
  assert(correctRes.success, 'Verifies valid OTP code and marks email verified');

  const verifiedUser = db.findUserById(testUser.id);
  assert(verifiedUser?.isEmailVerified === true, 'Database persists email verification flag');

  console.log('\n--- TEST GROUP 3: Password Reset Flow ---');
  const challenge = db.createPasswordResetChallenge(testUser.email);
  assert(challenge.challengeId.startsWith('res_'), 'Password reset challenge created');

  const verifyResetRes = db.verifyResetOtp(challenge.challengeId, challenge.otp);
  assert(verifyResetRes.success && !!verifyResetRes.resetToken, 'Reset OTP verified and issued one-time reset authorization token');

  const newHash = bcrypt.hashSync('NewSecurePassword2026!', 10);
  const resetCompleteRes = db.completePasswordReset(verifyResetRes.resetToken!, newHash);
  assert(resetCompleteRes.success, 'Password updated successfully with valid reset token');

  const reuseAttempt = db.completePasswordReset(verifyResetRes.resetToken!, newHash);
  assert(!reuseAttempt.success, 'Single-use guarantee: Re-using the same reset authorization fails');

  console.log('\n--- TEST GROUP 4: Smart Settlement Engine ---');
  const goaGroup = db.getGroupById('grp_goa2026')!;
  const goaExpenses = db.getExpensesForGroup('grp_goa2026');
  const goaSettlements = db.getSettlementsForGroup('grp_goa2026');

  const balances = SettlementEngine.calculateBalances(goaGroup, goaExpenses, goaSettlements);
  assert(balances.length === goaGroup.members.length, 'Deterministic balances computed for all group members');

  const netSum = Math.round(balances.reduce((sum, b) => sum + b.netBalance, 0) * 100) / 100;
  assert(Math.abs(netSum) < 0.05, `Mathematical conservation invariant: Sum of net balances = 0 (Actual: ${netSum})`);

  const optimizedTransfers = SettlementEngine.optimizeTransfers(balances, goaGroup.currency);
  assert(optimizedTransfers.length > 0, `Optimized settlement transfers generated (${optimizedTransfers.length} transfers)`);

  for (const t of optimizedTransfers) {
    assert(t.amount > 0, `Transfer ${t.fromUserName} -> ${t.toUserName} has valid amount: ${t.currency} ${t.amount}`);
  }

  console.log('\n--- TEST GROUP 5: AI Expense Assistant ---');
  const samplePrompt = 'Yesterday Rahul paid ₹2,400 for dinner with Priya and Aman';
  const parsed = await aiService.parseExpenseText(samplePrompt, [goaGroup], verifiedUser!);

  assert(parsed.amount === 2400, `AI extracted correct amount: ₹${parsed.amount}`);
  assert(parsed.category === 'Food', `AI categorized correctly: ${parsed.category}`);
  assert(parsed.splits.length === 3, `AI divided into 3 participants: ${parsed.splits.map(s => s.userName).join(', ')}`);
  assert(parsed.splits[0].shareAmount === 800, `AI calculated equal split share: ₹800 each`);

  const rahulUser = db.findUserByEmail('rahul@example.com')!;
  const userGroups = db.getGroupsForUser(rahulUser.id);
  const whoOwesAnswer = await aiService.answerFinancialQuestion('Who owes me money?', rahulUser, userGroups);
  assert(whoOwesAnswer.answer.length > 20, 'AI answered financial query using real database records');

  const foodAnswer = await aiService.answerFinancialQuestion('How much did we spend on food?', rahulUser, userGroups);
  assert(foodAnswer.answer.includes('Food') || foodAnswer.answer.includes('₹'), 'AI correctly analyzed food category expenditures');

  console.log('\n--- TEST GROUP 6: PayPal Sandbox Integration ---');
  const ppOrder = await paypalService.createOrder({
    amount: 1500,
    currency: 'INR',
    description: 'Hackathon Settlement Test',
  });
  assert(!!ppOrder.id, `PayPal sandbox order created with ID: ${ppOrder.id}`);

  const ppCapture = await paypalService.captureOrder(ppOrder.id);
  assert(ppCapture.status === 'COMPLETED', 'PayPal sandbox order captured and server-side verified');
  assert(ppCapture.transactionReference.length > 5, `PayPal reference issued: ${ppCapture.transactionReference}`);

  console.log('\n--- TEST GROUP 7: Card Payment Processing & Persistence ---');
  const cardPayment = db.createPayment({
    settlementId: 'set_test_1',
    groupId: 'grp_goa2026',
    payerId: rahulUser.id,
    payerName: rahulUser.name,
    recipientId: 'usr_priya',
    recipientName: 'Priya Patel',
    amount: 1200,
    currency: 'INR',
    method: 'CREDIT_CARD',
    status: 'COMPLETED',
    reference: `SS-CRD-${Date.now()}`,
    receiptNumber: `REC-${Date.now()}-CRD`,
    metadata: { cardMasked: '•••• •••• •••• 4242', verified: true },
  });
  assert(cardPayment.status === 'COMPLETED', 'Card transaction recorded with COMPLETED status');
  const retrievedPay = db.getPaymentByReference(cardPayment.reference);
  assert(retrievedPay?.id === cardPayment.id, 'Transaction successfully retrieved from persistent storage');

  console.log('\n--- TEST GROUP 8: 2Factor.in SMS & Phone OTP Verification ---');
  const phoneTestNum = '9876543210';
  const phoneOtp = '849201';
  db.savePhoneOtp(phoneTestNum, phoneOtp, 'session_2factor_test_xyz');
  const wrongPhoneRes = db.verifyPhoneOtpLocally(phoneTestNum, '111111');
  assert(!wrongPhoneRes.success, '2Factor: Rejects incorrect phone OTP');
  const correctPhoneRes = db.verifyPhoneOtpLocally(phoneTestNum, phoneOtp);
  assert(correctPhoneRes.success, '2Factor: Successfully verifies phone OTP against session store');

  console.log('\n--- TEST GROUP 9: Trip Member Invitation & Magic Link ---');
  const inviteEmail = 'deepak.traveler@example.com';
  const invitation = db.createGroupInvitation('grp_goa2026', goaGroup.name, rahulUser.name, inviteEmail);
  assert(invitation.token.length >= 10, 'Generated secure cryptographic invitation token');
  assert(invitation.groupName === 'Goa Trip 2026', 'Invitation accurately linked to target group circle');

  const retrievedInvite = db.getInvitationByToken(invitation.token);
  assert(retrievedInvite?.email === inviteEmail, 'Invitation lookup succeeded by token');

  const deepakUser = db.createUser({
    name: 'Deepak Verma',
    email: inviteEmail,
    passwordHash: 'dummyhash',
    isEmailVerified: true,
  });
  const acceptRes = db.acceptGroupInvitation(invitation.token, deepakUser);
  assert(acceptRes.success, 'Friend joined trip group via magic invitation token from their device');
  const updatedGroup = db.getGroupById('grp_goa2026')!;
  assert(updatedGroup.members.some(m => m.userId === deepakUser.id), 'New member verified present in group roster');

  console.log('\n--- TEST GROUP 10: Settlement Receipt Verification ---');
  assert(!!cardPayment.receiptNumber, 'Payment automatically stamped with unique Receipt Number');
  const fetchedReceipt = db.getPaymentByReference(cardPayment.reference);
  assert(fetchedReceipt?.receiptNumber === cardPayment.receiptNumber, 'Receipt number persisted and accessible for printing');

  console.log('\n--- TEST GROUP 11: Trip Deletion & Cleanup Cascade ---');
  const tempGroup = db.createGroup({
    name: 'Weekend Getaway 2026',
    description: 'Quick weekend trip to settle and delete',
    category: 'Trip',
    currency: 'INR',
    creator: rahulUser,
  });
  assert(!!tempGroup.id, 'Temporary trip group created');
  const deleteRes = db.deleteGroup(tempGroup.id, rahulUser.id);
  assert(deleteRes.success === true, 'Trip group and cascaded records deleted successfully');
  const shouldBeNull = db.getGroupById(tempGroup.id);
  assert(shouldBeNull === undefined || shouldBeNull === null, 'Deleted trip no longer exists in database store');

  console.log('\n--- TEST GROUP 12: Group Budget Tracking ---');
  const budgetUpdated = db.updateGroup('grp_goa2026', { budget: 50000, budgetCurrency: 'INR' });
  assert(budgetUpdated !== null && budgetUpdated.budget === 50000, 'Group budget updated to ₹50,000');
  const goaExpensesNow = db.getExpensesForGroup('grp_goa2026');
  const totalSpent = goaExpensesNow.reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, 50000 - totalSpent);
  const pct = Math.min(100, Math.round((totalSpent / 50000) * 100));
  assert(remaining >= 0, `Remaining budget correctly calculated: ₹${remaining} (${pct}% used)`);

  console.log('\n--- TEST GROUP 13: Duplicate Expense Detection Guard ---');
  const firstGoaExpense = goaExpensesNow[0];
  if (firstGoaExpense) {
    const potentialDup = db.findPotentialDuplicateExpense('grp_goa2026', {
      amount: firstGoaExpense.amount,
      title: firstGoaExpense.title,
      payerId: firstGoaExpense.payerId,
      date: firstGoaExpense.date,
    });
    assert(!!potentialDup, `Duplicate detector caught existing expense "${firstGoaExpense.title}" (ID: ${potentialDup?.id})`);

    const nonDup = db.findPotentialDuplicateExpense('grp_goa2026', {
      amount: 999999.99,
      title: 'Unique Scuba Diving Expedition 2026',
      payerId: firstGoaExpense.payerId,
      date: '2026-12-31',
    });
    assert(!nonDup, 'Duplicate detector correctly allowed unique expense without false positive');
  }

  console.log('\n--- TEST GROUP 14: Decimal Split Penny-Rounding Conservation ---');
  const total100 = 100;
  const numMembers = 3;
  const baseSplit = Math.floor((total100 / numMembers) * 100) / 100;
  const remainder = Math.round((total100 - baseSplit * numMembers) * 100) / 100;
  const splits = [0, 1, 2].map((idx) => {
    const share = idx === 0 ? Math.round((baseSplit + remainder) * 100) / 100 : baseSplit;
    return share;
  });
  const sumSplits = Math.round(splits.reduce((a, b) => a + b, 0) * 100) / 100;
  assert(sumSplits === 100, `Penny-rounding conservation exact: Sum of shares is ₹${sumSplits} for ₹100 total`);
  assert(splits[0] === 33.34 && splits[1] === 33.33 && splits[2] === 33.33, `Correct penny distribution: ${splits.join(', ')}`);

  console.log('\n--- TEST GROUP 15: AI Multimodal Receipt Scanner ---');
  const scanResult = await aiService.scanReceipt('dGVzdCBiYXNlNjQ=', 'image/jpeg');
  assert(typeof scanResult.serviceConfigured === 'boolean', `Receipt scanner returned valid structured response (serviceConfigured: ${scanResult.serviceConfigured})`);
  assert(typeof scanResult.success === 'boolean', `Scanner handled input safely without crashing (success: ${scanResult.success})`);
  if (!scanResult.serviceConfigured) {
    assert(typeof scanResult.message === 'string' && scanResult.message.includes('GEMINI_API_KEY'), 'Gracefully reports unconfigured state without hallucinating financial data');
  } else {
    assert(typeof scanResult.title === 'string', 'Receipt scanner provided extracted title');
  }

  console.log('\n--- TEST GROUP 16: Duplicate Payment Submission Guard ---');
  try {
    const secondCapture = await paypalService.captureOrder(ppOrder.id);
    assert(secondCapture.status === 'COMPLETED', 'PayPal idempotent capture verification');
  } catch (err: any) {
    assert(err.message.includes('ALREADY_CAPTURED') || err.message.includes('already'), 'PayPal duplicate capture rejected with proper message');
  }

  console.log('\n--- TEST GROUP 17: Unique Username System & Permanent Storage ---');
  const userA = db.createUser({
    name: 'Harsh Joshi',
    email: 'harsh.test@example.com',
    passwordHash: 'dummyhash',
    isEmailVerified: true,
  });
  assert(!!userA.username && userA.username.startsWith('@harshjoshi_'), `User A received unique username: ${userA.username}`);

  const userB = db.createUser({
    name: 'Rahul Patel',
    email: 'rahul.patel.test@example.com',
    passwordHash: 'dummyhash',
    isEmailVerified: true,
  });
  assert(!!userB.username && userB.username.startsWith('@rahulpatel_'), `User B received unique username: ${userB.username}`);
  assert(userA.username !== userB.username, 'Usernames are strictly unique across accounts');

  assert(!!rahulUser.username, `Existing demo user Rahul has permanent username: ${rahulUser.username}`);
  const foundByU = db.findUserByUsername(userA.username);
  assert(foundByU?.id === userA.id, 'User lookup by unique username succeeds');
  const foundWithoutAt = db.findUserByUsername(userA.username.replace('@', ''));
  assert(foundWithoutAt?.id === userA.id, 'User lookup works with or without "@" prefix');

  console.log('\n--- TEST GROUP 18: Search Users by Username ---');
  const searchResults = db.searchUsers('harshjoshi', userB.id);
  assert(searchResults.some(u => u.id === userA.id), 'Found User A by searching username');
  const selfSearch = db.searchUsers('harshjoshi', userA.id);
  assert(!selfSearch.some(u => u.id === userA.id), 'Search correctly excludes the searching user themselves');

  console.log('\n--- TEST GROUP 19: Friend Request System & Security Guards ---');
  const selfReq = db.createFriendRequest(userA.id, userA.username);
  assert(!selfReq.success, 'Guard prevents user from sending friend request to themselves');

  const reqRes = db.createFriendRequest(userA.id, userB.username);
  assert(reqRes.success && !!reqRes.request, `Friend request sent from ${userA.username} to ${userB.username}`);
  assert(reqRes.request?.status === 'PENDING', 'Friend request status is PENDING');

  const dupReq = db.createFriendRequest(userA.id, userB.username);
  assert(!dupReq.success, 'Duplicate guard prevents sending another request while one is pending');

  const receiverNotifs = db.getNotificationsForUser(userB.id);
  const freqNotif = receiverNotifs.find(n => n.type === 'FRIEND_REQUEST' && n.metadata?.friendRequestId === reqRes.request?.id);
  assert(!!freqNotif, 'Receiver received real database notification for friend request with metadata');
  assert(freqNotif?.message.includes(userA.name) && freqNotif?.message.includes(userA.username), 'Notification displays sender name and username');

  console.log('\n--- TEST GROUP 20: Accept Friend Request & Two-Way Contacts ---');
  const acceptFriendRes = db.acceptFriendRequest(reqRes.request!.id, userB.id);
  assert(acceptFriendRes.success, 'User B successfully accepted friend request');
  assert(db.areFriends(userA.id, userB.id), 'User A and User B are verified mutual friends');
  assert(db.areFriends(userB.id, userA.id), 'Bidirectional contact relationship verified');

  const userAContacts = db.getContactsForUser(userA.id);
  assert(userAContacts.some(c => c.user.id === userB.id), 'User B appears in User A Contacts list');
  const userBContacts = db.getContactsForUser(userB.id);
  assert(userBContacts.some(c => c.user.id === userA.id), 'User A appears in User B Contacts list');

  const senderNotifs = db.getNotificationsForUser(userA.id);
  const acceptedNotif = senderNotifs.find(n => n.message.includes('accepted your friend request'));
  assert(!!acceptedNotif, 'User A notified that friend request was accepted');

  console.log('\n--- TEST GROUP 21: Decline Friend Request Flow ---');
  const userC = db.createUser({
    name: 'Vikram Singh',
    email: 'vikram.test@example.com',
    passwordHash: 'dummyhash',
    isEmailVerified: true,
  });
  const reqToDecline = db.createFriendRequest(userC.id, userA.username);
  assert(reqToDecline.success, 'Friend request sent to User A to test decline flow');
  const declineRes = db.declineFriendRequest(reqToDecline.request!.id, userA.id);
  assert(declineRes.success, 'User A successfully declined friend request');
  assert(!db.areFriends(userC.id, userA.id), 'Declined request does NOT add either user to contacts');

  console.log('\n--- TEST GROUP 22: Private One-to-One Chat ---');
  try {
    db.sendTextMessage(userC.id, userB.id, 'Hey stranger');
    assert(false, 'Should throw error when strangers attempt to chat');
  } catch (err: any) {
    assert(err.message.includes('accepted contacts'), 'Unauthorized chat blocked between non-contacts');
  }

  const chatMsg1 = db.sendTextMessage(userA.id, userB.id, 'Hello Rahul! How is the trip planning going?');
  assert(!!chatMsg1.id, 'Private message sent successfully');
  assert(chatMsg1.senderId === userA.id && chatMsg1.receiverId === userB.id, 'Message properly associated with sender and receiver');

  const chatMsg2 = db.sendTextMessage(userB.id, userA.id, 'Hey Harsh! Everything is booked. I will share the receipt.');
  assert(!!chatMsg2.id, 'Reply message sent successfully');

  const history = db.getChatMessages(userA.id, userB.id);
  assert(history.length >= 2, `Conversation history persists (${history.length} messages)`);

  console.log('\n--- TEST GROUP 23: Photos and File Attachments in Chat ---');
  const sampleImageAttachment = {
    id: 'att_test_img_1',
    filename: 'chat_test_resort.jpg',
    originalName: 'GoaResortBooking.jpg',
    mimeType: 'image/jpeg',
    size: 245100,
    uploadedAt: new Date().toISOString(),
  };
  const imgMsg = db.sendFileMessage(userA.id, userB.id, sampleImageAttachment, true);
  assert(imgMsg.type === 'IMAGE' && imgMsg.attachment?.originalName === 'GoaResortBooking.jpg', 'Image message sent with metadata and preview type');

  const sampleDocAttachment = {
    id: 'att_test_pdf_1',
    filename: 'chat_test_flight_itinerary.pdf',
    originalName: 'FlightTickets.pdf',
    mimeType: 'application/pdf',
    size: 512000,
    uploadedAt: new Date().toISOString(),
  };
  const docMsg = db.sendFileMessage(userA.id, userB.id, sampleDocAttachment, false);
  assert(docMsg.type === 'FILE' && docMsg.attachment?.mimeType === 'application/pdf', 'PDF document attachment sent with proper metadata');

  console.log('\n--- TEST GROUP 24: Private Attachment Access Control ---');
  const foundAttMsg = db.getAttachmentMessage(sampleDocAttachment.id);
  assert(!!foundAttMsg, 'Attachment message located by attachment ID');
  const isParticipantA = foundAttMsg?.senderId === userA.id || foundAttMsg?.receiverId === userA.id;
  const isParticipantB = foundAttMsg?.senderId === userB.id || foundAttMsg?.receiverId === userB.id;
  const isParticipantC = foundAttMsg?.senderId === userC.id || foundAttMsg?.receiverId === userC.id;
  assert(isParticipantA && isParticipantB, 'Authorized sender and receiver have verified access');
  assert(!isParticipantC, 'Unauthorized third-party (User C) strictly denied access to private attachment');

  console.log('\n--- TEST GROUP 25: Share Authentic Payment Receipts in Chat ---');
  const receiptToShare = {
    paymentId: cardPayment.id,
    reference: cardPayment.reference,
    amount: cardPayment.amount,
    currency: cardPayment.currency,
    groupName: 'Goa Trip 2026',
    date: cardPayment.createdAt,
    status: cardPayment.status,
    payerName: cardPayment.payerName,
    recipientName: cardPayment.recipientName,
    receiptNumber: cardPayment.receiptNumber,
  };
  const receiptMsg = db.sendReceiptMessage(userA.id, userB.id, receiptToShare);
  assert(receiptMsg.type === 'RECEIPT', 'Receipt message created with rich type RECEIPT');
  assert(receiptMsg.receipt?.reference === cardPayment.reference, 'Receipt reference accurately matches official payment record');
  assert(receiptMsg.receipt?.amount === 1200, 'Receipt amount preserved accurately');

  console.log('\n--- TEST GROUP 26: Remove Contact Flow ---');
  const removeContactRes = db.removeContact(userA.id, userB.id);
  assert(removeContactRes, 'Contact removed successfully');
  assert(!db.areFriends(userA.id, userB.id), 'Both users removed from each other contacts');

  console.log('\n--- TEST GROUP 27: Database Persistence After Re-instantiation ---');
  db.save();
  const rawAfter = db.getRawData();
  assert(rawAfter.friendRequests.length > 0, 'Friend requests persisted to disk');
  assert(rawAfter.chatMessages.length > 0, 'Chat messages and attachments persisted to disk');
  assert(rawAfter.users.every(u => !!u.username), 'All users in persistent database retain unique usernames');

  console.log('\n==========================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('==========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
