import mongoose, { ClientSession } from 'mongoose';
import { User } from '../models/User';
import { WalletTransaction, TransactionType } from '../models/WalletTransaction';

export const processReferralBonus = async (userId: mongoose.Types.ObjectId, session: ClientSession) => {
  const user = await User.findById(userId).session(session);
  
  if (!user) {
    return;
  }

  // Only issue bonus on their FIRST order
  if (user.hasCompletedFirstOrder) {
    return;
  }

  // Mark that they have completed their first order
  user.hasCompletedFirstOrder = true;
  await user.save({ session });

  // If they were referred by someone, issue the bonus to the referrer
  if (user.referredBy) {
    // 10 credits (e.g., $10) bonus
    const BONUS_AMOUNT = 10;

    const bonusTransaction = new WalletTransaction({
      userId: user.referredBy,
      amount: BONUS_AMOUNT,
      type: TransactionType.Credit,
      description: `Referral bonus for user ${user.firstName} completing first order`
    });

    await bonusTransaction.save({ session });
  }
};
