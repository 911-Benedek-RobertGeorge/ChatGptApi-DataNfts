'use client';
import { useEffect, useState } from 'react';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import moment from 'moment';
import {
  Button,
  OutputContainer,
  PingPongOutput,
  ContractAddress,
  Label
} from '@/components';
import { getCountdownSeconds, setTimeRemaining } from '@/helpers';
import { useGetPendingTransactions, useSendPingPongTransaction } from '@/hooks';
import { SessionEnum } from '@/localConstants';
import { SignedTransactionType } from '@/types';
import { useGetTimeToPong, useGetPingAmount } from './hooks';

export const PingPongAbi = () => {
  const getTimeToPong = useGetTimeToPong();
  const pingAmount = useGetPingAmount();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const {
    sendPingTransactionFromAbi,
    sendPongTransactionFromAbi,
    transactionStatus
  } = useSendPingPongTransaction(SessionEnum.abiPingPongSessionId);

  const [stateTransactions, setStateTransactions] = useState<
    SignedTransactionType[] | null
  >(null);
  const [hasPing, setHasPing] = useState<boolean>(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  const setSecondsRemaining = async () => {
    const secondsRemaining = await getTimeToPong();
    const { canPing, timeRemaining } = setTimeRemaining(secondsRemaining);

    setHasPing(canPing);
    if (timeRemaining && timeRemaining >= 0) {
      setSecondsLeft(timeRemaining);
    }
  };

  const sendPingTransaction = async () => {
    await sendPingTransactionFromAbi(pingAmount);
  };

  const sendPongTransaction = async () => {
    await sendPongTransactionFromAbi();
  };

  const timeRemaining = moment()
    .startOf('day')
    .seconds(secondsLeft ?? 0)
    .format('mm:ss');

  const pongAllowed = secondsLeft === 0;

  useEffect(() => {
    getCountdownSeconds({ secondsLeft, setSecondsLeft });
  }, [hasPing]);

  useEffect(() => {
    if (transactionStatus.transactions) {
      setStateTransactions(transactionStatus.transactions);
    }
  }, [transactionStatus]);

  useEffect(() => {
    setSecondsRemaining();
  }, [hasPendingTransactions]);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <div className='flex justify-start gap-2'>
          <Button
            disabled={!hasPing || hasPendingTransactions}
            onClick={sendPingTransaction}
            data-testid='btnPingAbi'
            className='inline-block rounded-lg px-3 py-2 text-center hover:no-underline my-0 bg-blue-600 text-white hover:bg-blue-700 mr-0 disabled:bg-gray-200 disabled:text-black disabled:cursor-not-allowed'
          >
            <FontAwesomeIcon icon={faArrowUp} className='mr-1' />
            Ping
          </Button>

          <Button
            disabled={!pongAllowed || hasPing || hasPendingTransactions}
            data-testid='btnPongAbi'
            onClick={sendPongTransaction}
            className='inline-block rounded-lg px-3 py-2 text-center hover:no-underline my-0 bg-blue-600 text-white hover:bg-blue-700 mr-0 disabled:bg-gray-200 disabled:text-black disabled:cursor-not-allowed'
          >
            <FontAwesomeIcon icon={faArrowDown} className='mr-1' />
            Pong
          </Button>
        </div>
      </div>

      <OutputContainer>
        {!stateTransactions && (
          <>
            <ContractAddress />
            {!pongAllowed && (
              <p>
                <Label>Time remaining: </Label>
                <span className='text-red-600'>{timeRemaining}</span> until able
                to pong
              </p>
            )}
          </>
        )}

        <PingPongOutput
          transactions={stateTransactions}
          pongAllowed={pongAllowed}
          timeRemaining={timeRemaining}
        />
      </OutputContainer>
    </div>
  );
};
