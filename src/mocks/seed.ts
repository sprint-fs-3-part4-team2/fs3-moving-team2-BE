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
  createTargetedQuoteReject,
  createTargetedQuoteRequest,
  createUser,
} from './service/create';

async function main() {
  const timeText = '걸린 시간:';
  console.time(timeText);
  //시작 하는 부분
  console.log(`🎉 seed 작업 시작`);
  try {
    // user
    await createUser();
    await createCustomer();
    await createMover();
    await createNotification();
    await createCustomerService();
    await createCustomerFavorite();
    await createQuoteRequest();
    await createMoverQuote();
    await createQuoteMatch();
    await createMoverService();
    await createMoverServiceResion();
    await createQuoteRequestAddress();
    await createQuoteStatusHistory();
    await createTargetedQuoteRequest();
    await createTargetedQuoteReject();
  } catch (err) {
    // 끝나는 부분
    console.error(`seed 실패 : ${err}`);
  } finally {
    console.log(`🚀 seed 작업완료`);
    console.timeEnd(timeText);
  }
}

main();
