import React, {useRef,useEffect,createRef,useState,useContext,useMemo,} from "react";
import { useTestMode } from "../Context/TestMode";
import Stats from "./Stats";
import UpperMenu from "./UpperMenu";

var randomWords = require("random-words");

const TypingBox = ({}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(1);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [countDown, setCountDown] = useState(15);
  const [testStart, setTestStart] = useState(false);
  const [testOver, setTestOver] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [correctChars, setCorrectChars] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [wordsArray, setWordsArray] = useState(() => {
    return randomWords(100);
  });

  const words = useMemo(() => {
    return wordsArray;
  }, [wordsArray]);

  const wordSpanRef = useMemo(() => {
    return Array(words.length)
      .fill(0)
      .map((i) => createRef(null));
  }, [words]);

  const resetWordSpanRefClassNames = () => {
    wordSpanRef.map((i) => {
      Array.from(i.current.childNodes).map((j) => {
        j.className = "char";
      });
    });
    wordSpanRef[0].current.childNodes[0].className = " char current";
  };

  const { testTime } = useTestMode();

  const inputTextRef = useRef(null);

  const startTimer = () => {
    const intervalId = setInterval(timer, 1000);
    setIntervalId(intervalId);

    function timer() {
      setCountDown((prevCountDown) => {
        if (prevCountDown === 1) {
          clearInterval(intervalId);
          setCountDown(0);
          setTestOver(true);
        } else {
          return prevCountDown - 1;
        }
      });
    }
  };

  const handelKeyDown = (e) => {
    if (!testStart) {
      startTimer();
      setTestStart(true);
    }

    let allChildrenSpan = wordSpanRef[currentWordIndex].current.childNodes;

    //logic for space
    if (e.keyCode === 32) {
      const correctChar =
        wordSpanRef[currentWordIndex].current.querySelectorAll(".correct");
      if (correctChar.length === allChildrenSpan.length) {
        setCorrectWords(correctWords + 1);
      }
      // remov cursor from word
      if (allChildrenSpan.length <= currentCharIndex) {
        // allChildrenSpan[currentCharIndex - 1].classList.remove("right");
        allChildrenSpan[currentCharIndex - 1].className = allChildrenSpan[
          currentCharIndex - 1
        ].className.replace("right", "");
      } else {
        allChildrenSpan[currentCharIndex].className = allChildrenSpan[
          currentCharIndex
        ].className.replace("current", "");
      }

      //add cursor to next word
      wordSpanRef[currentWordIndex + 1].current.childNodes[0].className =
        "char current";

      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentCharIndex(0);

      return;
    }

    //logic for backspace
    if (e.keyCode === 8) {
      if (currentCharIndex !== 0) {
        if (currentCharIndex === allChildrenSpan.length) {
          if (
            allChildrenSpan[currentCharIndex - 1].className.includes("extra")
          ) {
            allChildrenSpan[currentCharIndex - 1].remove();
            allChildrenSpan[currentCharIndex - 2].className += " right";
          } else {
            allChildrenSpan[currentCharIndex - 1].className = "char current";
          }
          setCurrentCharIndex(currentCharIndex - 1);
          return;
        }

        allChildrenSpan[currentCharIndex].className = "char";
        allChildrenSpan[currentCharIndex - 1].className = "char current";
        setCurrentCharIndex(currentCharIndex - 1);
      }
      return;
    }

    //logic for incorrect entry instead of space
    if (currentCharIndex === allChildrenSpan.length) {
      let newSpan = document.createElement("span");
      newSpan.innerText = e.key;
      newSpan.className = "char incorrect right extra";
      allChildrenSpan[currentCharIndex - 1].className = allChildrenSpan[
        currentCharIndex - 1
      ].className.replace("right", "");

      wordSpanRef[currentWordIndex].current.append(newSpan);
      setCurrentCharIndex(currentCharIndex + 1);
      return;
    }

    //logic for correct & incorrect characters
    if (e.key === allChildrenSpan[currentCharIndex].innerText) {
      allChildrenSpan[currentCharIndex].className = "char correct";
      setCorrectChars(correctChars + 1);
    } else {
      allChildrenSpan[currentCharIndex].className = "char incorrect";
    }

    if (currentCharIndex + 1 === allChildrenSpan.length) {
      allChildrenSpan[currentCharIndex].className += " right";
      setCurrentCharIndex(currentCharIndex + 1);
    } else {
      allChildrenSpan[currentCharIndex + 1].className = "char current";
      setCurrentCharIndex(currentCharIndex + 1);
    }
  };

  const calculateWPM = () => {
    return Math.round(correctChars / 5 / (testTime / 60));
  };

  const calculateAccuracy = () => {
    console.log(correctWords, currentWordIndex);
    return Math.round((correctWords / currentWordIndex) * 100);
  };

  const resetTest = () => {
    setCurrentCharIndex(0);
    setCurrentWordIndex(0);
    setTestStart(false);
    setTestOver(false);
    clearInterval(intervalId);
    setCountDown(testTime);
    let random = randomWords(100);
    setWordsArray(random);
    resetWordSpanRefClassNames();
  };

  const focusInput = () => {
    inputTextRef.current.focus();
  };

  useEffect(() => {
    resetTest();
  }, [testTime]);

  useEffect(() => {
    focusInput();
    wordSpanRef[0].current.childNodes[0].className = "char current";
  }, []);

  return (
    <div>
      <UpperMenu countDown={countDown} />
      {testOver ? (
        <Stats wpm={calculateWPM()} accuracy={calculateAccuracy()} />
      ) : (
        <div className="type-box" onClick={focusInput}>
          <div className="words">
            {words.map((word, index) => (
              <span className="word" ref={wordSpanRef[index]} key={index}>
                {word.split("").map((char, idx) => (
                  <span className="char" key={`char${idx}`}>
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      <input
        type="text"
        className="hidden-input"
        ref={inputTextRef}
        onKeyDown={(e) => handelKeyDown(e)}
      />
    </div>
  );
};

export default TypingBox;
