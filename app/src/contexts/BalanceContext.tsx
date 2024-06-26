import { useSui } from '@/hooks/useSui';
import { ChildrenProps } from '@/types/ChildrenProps';
import { useZkLogin } from '@mysten/enoki/react';
import { MIST_PER_SUI } from '@mysten/sui.js/utils';
import BigNumber from 'bignumber.js';
import { createContext, useContext, useEffect, useState } from 'react';

export const useBalance = () => useContext(BalanceContext);

interface BalanceContextProps {
  balance: BigNumber;
  isLoading: boolean;
  handleRefreshBalance: () => void;
}

export const BalanceContext = createContext<BalanceContextProps>({
  balance: BigNumber(0),
  isLoading: true,
  handleRefreshBalance: () => {}
});

export const BalanceProvider = ({ children }: ChildrenProps) => {
  const [balance, setBalance] = useState(BigNumber(0));
  const [isLoading, setIsLoading] = useState(false);
  const { suiClient } = useSui();
  const { address } = useZkLogin();

  useEffect(() => {
    if (address) handleRefreshBalance();
  }, [address]);

  const handleRefreshBalance = async () => {
    if (!address) return;

    setIsLoading(true);
    await suiClient
      .getBalance({
        owner: address!
      })
      .then((resp) => {
        setIsLoading(false);
        setBalance(
          BigNumber(resp.totalBalance).dividedBy(
            BigNumber(Number(MIST_PER_SUI))
          )
        );
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        setBalance(BigNumber(0));
      });
  };

  return (
    <BalanceContext.Provider
      value={{ balance, handleRefreshBalance, isLoading }}
    >
      {children}
    </BalanceContext.Provider>
  );
};
