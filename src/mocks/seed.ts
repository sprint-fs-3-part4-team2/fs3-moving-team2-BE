import { endMsg } from './lib/msg';
import {
  createCustomer,
  createCustomerFavorite,
  createCustomerService,
  createMover,
  createMoverQuote,
  createMoverService,
  createMoverServiceResion,
  createNotification,
  createQuoteMatch,
  createQuoteRequest,
  createQuoteRequestAddress,
  createQuoteStatusHistory,
  createReview,
  createTargetedQuoteReject,
  createTargetedQuoteRequest,
  createUser,
  updateFavorite,
} from './service/create';

async function main() {
  const timeText = '걸린 시간:';
  console.time(timeText);
  console.log(`🎉🤡 seed 작업 시작`);
  try {
    await createUser();
    await createCustomer();
    await createMover();
    await createNotification();
    await createCustomerService();
    await createCustomerFavorite();
    await createQuoteRequest();
    await createMoverQuote();
    await createMoverService();
    await createQuoteMatch();
    await createMoverServiceResion();
    await createQuoteRequestAddress();
    await createQuoteStatusHistory();
    await createTargetedQuoteRequest();
    await createTargetedQuoteReject();
    await createReview();
    await updateFavorite();
  } catch (err) {
    console.error(`seed 실패 : ${err}`);
  } finally {
    endMsg(`seed 작업완료`);
    console.timeEnd(timeText);
  }
}

main();
