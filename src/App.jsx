import './App.css'
import { ethers } from "ethers";
import lotteryABI from "../abi/lottery.json";
import { toast } from "react-toastify";
import { useState, useRef, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";


function App() {

  const startRef = useRef();
  const endRef = useRef();
  const entryRef = useRef();
  const selectRef = useRef();
  const selectRef2 = useRef();
  const selectRef3 = useRef();


  const [list, setList] = useState([]);
  const [gId, setGID] = useState(0);
  const [gId2, setGID2] = useState(0);
  const [gId3, setGID3] = useState(0);

  const [lot, setLot] = useState({});
  const [winner, setWinner] = useState("0x");
  const [amount2, setAmount2] = useState(0);

  const lotteryAddress = "0x62251FD8F91e7D4D09dB5251bD9fBC0fB92A16f5";

  const options = { timeZone: 'Africa/Lagos', hour12: false };



  const createWriteContract = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = await provider.getSigner();
    const priceContract = new ethers.Contract(lotteryAddress, lotteryABI.abi, signer);
    return priceContract;
  }

  const createGetContract = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum)
    const priceContract = new ethers.Contract(lotteryAddress, lotteryABI.abi, provider);
    return priceContract;
  }


  const createLottery = async (evt) => {
    evt.preventDefault();
    const contract = await createWriteContract();

    const id = toast.loading("Creating Lottery....");

    try {
      const start = Math.floor(new Date(startRef.current.value).getTime() / 1000);
      const end = Math.floor(new Date(endRef.current.value).getTime() / 1000);
      const entry = ethers.utils.parseEther(entryRef.current.value);

      const tx = await contract.createLottery(entry, start, end);

      await tx.wait();
      setTimeout(() => {
        window.location.href = "/";
      }, 10000);

      toast.update(id, {
        render: "Transaction successfull",
        type: "success",
        isLoading: false,
        autoClose: 10000,
        closeButton: true,
      });
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: `${error.reason}`,
        type: "error",
        isLoading: false,
        autoClose: 10000,
        closeButton: true,
      });
    }
  };

  const getlastLottery = async () => {
    const contract = await createGetContract();
    const lotteryCount = await contract.lotteryId();

    let arr = [];

    for (let i = 0; i < Number(lotteryCount); i++) {
      arr.push({ lotteryId: i, lotteryName: "Lottery " + i })
    }
    setList(arr);
  };

  const getLottery = async () => {
    const contract = await createGetContract();
    const lottery = await contract.idToLottery(gId);
    let obj = {
      startTime: Number(lottery.lotteryStartTime),
      endTime: Number(lottery.lotteryEndTime),
      entryFee: Number(lottery.entryFee),
    }
    setLot(obj);
  };

  const getWinner = async () => {
    const contract = await createGetContract();
    const lottery = await contract.idToLottery(gId2);
    setWinner(lottery.winner);
  };

  const withdrawWinning = async (evt) => {
    evt.preventDefault();
    const contract = await createWriteContract();

    const id = toast.loading("Withdrawing....");

    try {
      const tx = await contract.withdrawWinnings(selectRef3.current.value);

      await tx.wait();
      setTimeout(() => {
        window.location.href = "/";
      }, 10000);

      toast.update(id, {
        render: "Transaction successfull",
        type: "success",
        isLoading: false,
        autoClose: 10000,
        closeButton: true,
      });
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: `${error.reason}`,
        type: "error",
        isLoading: false,
        autoClose: 10000,
        closeButton: true,
      });
    }
  };




  useEffect(() => {
    getlastLottery();
    getLottery();
    getWinner();
  }, [gId, gId2]);


  return (
    <>
      <h1> Lottery App </h1>

      <div>
        <div className='options'>
          <div className='text1'>Create Lottery</div>
          <input ref={entryRef} className='input1' placeholder='Enter Entry Fee' />
          Lottery Start Date
          <input ref={startRef} type="datetime-local" className='input1' placeholder='Enter Start Time' />
          Lottery End Date
          <input ref={endRef} type="datetime-local" className='input1' placeholder='Enter End Time' />

          <button onClick={createLottery} className='but1'>Create Lottery</button>
        </div>

        <div className='options'>
          <div className='text1'>Select Lottery</div>
          <select ref={selectRef} onChange={() => setGID(selectRef.current.value)} className='input1' name="cars" id="cars">
            {
              list.map((item) => {
                return <option key={item.lotteryId} value={item.lotteryId} >{item.lotteryName}</option>
              })
            }
          </select>
          <div className='text'>Entry Fee  -  {lot?.entryFee / 10 ** 18} ether</div>
          <div className='text'>Start Date - {new Date(lot?.startTime * 1000).toLocaleString('en-US', options)}</div>
          <div className='text'>End Date - {new Date(lot?.endTime * 1000).toLocaleString('en-US', options)}</div>
          <button className='but1'>Enter Lottery</button>
        </div>


        <div className='options'>
          <div className='text1'>Check Winner</div>

          <div className='text1'>Select Lottery</div>
          <select ref={selectRef2} onChange={() => setGID2(selectRef2.current.value)} className='input1' name="cars" id="cars">
            {
              list.map((item) => {
                return <option key={item.lotteryId} value={item.lotteryId} >{item.lotteryName}</option>
              })
            }
          </select>
          <div className='text1'> Winner is {winner}</div>
        </div>

        <div className='options'>
          <div className='text1'>Withdraw Winnings</div>
          <div className='text1'>Select Lottery</div>
          <select ref={selectRef3} onChange={() => setGID(selectRef.current.value)} className='input1' name="cars" id="cars">
            {
              list.map((item) => {
                return <option key={item.lotteryId} value={item.lotteryId} >{item.lotteryName}</option>
              })
            }
          </select>
          <button onClick={withdrawWinning} className='but1'>Withdraw</button>
        </div>


      </div>
    </>
  )
}

export default App
