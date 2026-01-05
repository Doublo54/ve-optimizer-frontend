import type { NextPage } from 'next';
import Head from 'next/head';
import { Optimizer } from '../components/Optimizer';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>veToken Voting Optimizer</title>
        <meta
          content="Optimize your veToken voting power allocation across liquidity pools to maximize returns from protocol fees and external bribes."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Optimizer />
    </>
  );
};

export default Home;
