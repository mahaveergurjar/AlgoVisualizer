import React, { useState, useEffect, useCallback } from 'react';
import { Code, Layers, Clock } from 'lucide-react';
import VisualizerPointer from '../../components/VisualizerPointer';

const QueueUsingStacks = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [commands, setCommands] = useState('MyQueue,push,push,peek,pop,empty');
  const [argsInput, setArgsInput] = useState('-,1,2,-,-,-');
  const [isLoaded, setIsLoaded] = useState(false);

  const generateHistory = useCallback((commands, argsInput) => {
    const newHistory = [];
    let stack1 = [];
    let stack2 = [];
    let result = [];

    const addState = (props) =>
      newHistory.push({
        stack1: [...stack1],
        stack2: [...stack2],
        i: null,
        j: null,
        result: [...result],
        line: null,
        explanation: '',
        ...props,
      });
    addState({
      line: 3,
      explanation: 'Stacks "s1" and "s2" are initialized as empty stacks',
    });
    addState({
      line: 4,
      i: 0,
      j: 0,
      explanation: 'Initialize an new object of MyQueue class.',
    });
    result.push('null');
    addState({
      line: 5,
      i: 0,
      j: 0,
      explanation: 'Initialize an new object of MyQueue class.',
    });
    const argsArray = argsInput.split(',').map((arg) => arg.trim());
    commands
      .split(',')
      .slice(1)
      .forEach((command, index) => {
        const adjustedIndex = index + 1;
        switch (command.trim()) {
          case 'push':
            addState({
              line: 6,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: `Performing push operation with ${argsArray[adjustedIndex]} element`,
            });
            addState({
              line: 7,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: 'Check whether the stack "s1" has elements or not',
            });
            while (stack1.length) {
              const element = stack1.pop();
              stack2.push(element);
              addState({
                line: 8,
                i: adjustedIndex,
                j: adjustedIndex,
                explanation: `Push the top element ${element} of stack "s1" to stack "s2"`,
              });
              addState({
                line: 9,
                i: adjustedIndex,
                j: adjustedIndex,
                explanation: `Pop the top element ${element} of stack "s1" to stack "s2"`,
              });
            }
            stack1.push(argsArray[adjustedIndex]);
            result.push('null');
            addState({
              line: 11,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: `Push the new element ${argsArray[adjustedIndex]} to stack "s2"`,
            });
            addState({
              line: 12,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: 'Check whether the stack "s2" has elements or not',
            });
            while (stack2.length) {
              const element = stack2.pop();
              stack1.push(element);
              addState({
                line: 13,
                i: adjustedIndex,
                j: adjustedIndex,
                explanation: `Push the top element ${element} of stack "s2" to stack "s1"`,
              });
              addState({
                line: 14,
                i: adjustedIndex,
                j: adjustedIndex,
                explanation: `Pop the top element ${element} of stack "s2" to stack "s1"`,
              });
            }
            addState({
              line: 15,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: '',
            });
            addState({
              line: 16,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: '',
            });
            break;
          case 'pop':
            const ans = stack1.pop() || false;
            if (!ans) {
              addState({
                i: adjustedIndex,
                j: adjustedIndex,
                explanation: 'No element to pop',
              });
              break;
            }
            addState({
              line: 17,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: '',
            });
            addState({
              line: 18,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: `Storing element ${ans} in ans to return it after popingg`,
            });
            addState({
              line: 19,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: `Popping element ${ans} from stack "s1"`,
            });
            result.push(ans);
            addState({
              line: 20,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: `Returning element ${ans} for the pop function call`,
            });
            addState({
              line: 21,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: '',
            });
            break;
          case 'peek':
            addState({
              line: 22,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: '',
            });
            const element = stack1[stack1.length - 1];
            addState({
              line: 23,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: `Peeking the top element ${element} of queue`,
            });
            result.push(element);
            addState({
              line: 24,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: '',
            });
            break;
          case 'empty':
            addState({
              line: 25,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: '',
            });
            addState({
              line: 26,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: 'Check if the stack "s1" is empty or not',
            });
            result.push('false');
            addState({
              line: 27,
              i: adjustedIndex,
              j: adjustedIndex,
              explanation: '',
            });
            break;
        }
      });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadData = () => {
    const commandsArray = commands.split(',');
    const argsArray = argsInput.split(',');
    if (commandsArray.length !== argsArray.length) {
      alert('The length of commands and args is not same');
      return;
    }
    const allowedCommands = ['push', 'pop', 'peek', 'empty', 'myqueue'];
    const isCommandValid = commandsArray.every((command) =>
      allowedCommands.includes(command.toLowerCase())
    );
    if (!isCommandValid) {
      alert(
        'Command array should only contain one among push, pop, peek ,empty'
      );
      return;
    }
    const classCount = commandsArray.filter(
      (command) => command === 'MyQueue'
    ).length;
    if (classCount === 0) {
      alert('Missing MyQueue class init');
      return;
    }
    if (classCount > 1) {
      alert('The MyQueue class init should only be used once');
      return;
    }
    if (commandsArray[0] !== 'MyQueue') {
      alert('The first index of command array should be MyQueue to init');
      return;
    }
    let isValid = true;
    commandsArray.forEach((command, index) => {
      if (command === 'push') {
        if (!(argsArray[index] - '0')) {
          isValid = false;
        }
      } else {
        if (argsArray[index] !== '-') {
          isValid = false;
        }
      }
    });
    if (!isValid) {
      alert('The args are not properly mapped to commands');
      return;
    }
    setIsLoaded(true);
    generateHistory(commands, argsInput);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLoaded) return;
      if (e.key === 'ArrowLeft') stepBackward();
      if (e.key === 'ArrowRight') stepForward();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoaded, stepBackward, stepForward]);

  const state = history[currentStep] || {};
  const {
    stack1 = [],
    stack2 = [],
    i,
    j,
    result = [],
    line,
    explanation,
  } = state;

  const codeLines = [
    {
      num: 1,
      content: [
        { t: 'class', c: 'purple' },
        { t: ' MyQueue', c: 'cyan' },
        { t: ' {', c: 'indigo' },
      ],
    },
    {
      num: 2,
      content: [{ t: 'public:', c: 'pink' }],
    },
    {
      num: 3,
      content: [
        { t: '    ', c: '' },
        { t: 'stack', c: 'teal' },
        { t: '<', c: 'indigo' },
        { t: 'int', c: 'blue' },
        { t: '>', c: 'indigo' },
        { t: ' s1, s2;', c: 'green' },
      ],
    },
    {
      num: 4,
      content: [
        { t: '    MyQueue', c: 'cyan' },
        { t: '()', c: 'indigo' },
        { t: ' {', c: 'indigo' },
      ],
    },
    {
      num: 5,
      content: [{ t: '        }', c: 'indigo' }],
    },
    {
      num: 6,
      content: [
        { t: '    ', c: '' },
        { t: 'void', c: 'orange' },
        { t: ' push(', c: 'indigo' },
        { t: 'int', c: 'blue' },
        { t: ' x', c: 'green' },
        { t: ')', c: 'indigo' },
        { t: ' {', c: 'indigo' },
      ],
    },
    {
      num: 7,
      content: [
        { t: '        ', c: '' },
        { t: 'while', c: 'red' },
        { t: '(!', c: 'indigo' },
        { t: 's1', c: 'green' },
        { t: '.empty()) {', c: 'indigo' },
      ],
    },
    {
      num: 8,
      content: [
        { t: '            ', c: '' },
        { t: 's2', c: 'green' },
        { t: '.push(', c: 'indigo' },
        { t: 's1', c: 'green' },
        { t: '.top());', c: 'indigo' },
      ],
    },
    {
      num: 9,
      content: [
        { t: '            ', c: '' },
        { t: 's1', c: 'green' },
        { t: '.pop();', c: 'indigo' },
      ],
    },
    {
      num: 10,
      content: [{ t: '        }', c: 'indigo' }],
    },
    {
      num: 11,
      content: [
        { t: '        ', c: '' },
        { t: 's1', c: 'green' },
        { t: '.push(', c: 'indigo' },
        { t: 'x', c: 'green' },
        { t: ');', c: 'indigo' },
      ],
    },
    {
      num: 12,
      content: [
        { t: '        ', c: '' },
        { t: 'while', c: 'red' },
        { t: '(!', c: 'indigo' },
        { t: 's2', c: 'green' },
        { t: '.empty()) {', c: 'indigo' },
      ],
    },
    {
      num: 13,
      content: [
        { t: '            ', c: '' },
        { t: 's1', c: 'green' },
        { t: '.push(', c: 'indigo' },
        { t: 's2', c: 'green' },
        { t: '.top());', c: 'indigo' },
      ],
    },
    {
      num: 14,
      content: [
        { t: '            ', c: '' },
        { t: 's2', c: 'green' },
        { t: '.pop();', c: 'indigo' },
      ],
    },
    {
      num: 15,
      content: [{ t: '        }', c: 'indigo' }],
    },
    {
      num: 16,
      content: [{ t: '    }', c: 'indigo' }],
    },
    {
      num: 17,
      content: [
        { t: '    ', c: '' },
        { t: 'int', c: 'blue' },
        { t: ' pop()', c: 'indigo' },
        { t: ' {', c: 'indigo' },
      ],
    },
    {
      num: 18,
      content: [
        { t: '        ', c: '' },
        { t: 'int', c: 'blue' },
        { t: ' ans = ', c: '' },
        { t: 's1', c: 'green' },
        { t: '.top();', c: 'indigo' },
      ],
    },
    {
      num: 19,
      content: [
        { t: '        ', c: '' },
        { t: 's1', c: 'green' },
        { t: '.pop();', c: 'indigo' },
      ],
    },
    {
      num: 20,
      content: [
        { t: '        ', c: '' },
        { t: 'return', c: 'orange' },
        { t: ' ans;', c: 'indigo' },
      ],
    },
    {
      num: 21,
      content: [{ t: '    }', c: 'indigo' }],
    },
    {
      num: 22,
      content: [
        { t: '    ', c: '' },
        { t: 'int', c: 'blue' },
        { t: ' peek()', c: 'indigo' },
        { t: ' {', c: 'indigo' },
      ],
    },
    {
      num: 23,
      content: [
        { t: '        ', c: '' },
        { t: 'return', c: 'orange' },
        { t: ' s1', c: 'green' },
        { t: '.top();', c: 'indigo' },
      ],
    },
    {
      num: 24,
      content: [{ t: '    }', c: 'indigo' }],
    },
    {
      num: 25,
      content: [
        { t: '    ', c: '' },
        { t: 'bool', c: 'teal' },
        { t: ' empty()', c: 'indigo' },
        { t: ' {', c: 'indigo' },
      ],
    },
    {
      num: 26,
      content: [
        { t: '        ', c: '' },
        { t: 'return', c: 'orange' },
        { t: ' s1', c: 'green' },
        { t: '.empty();', c: 'indigo' },
      ],
    },
    {
      num: 27,
      content: [{ t: '    }', c: 'indigo' }],
    },
    {
      num: 28,
      content: [{ t: '};', c: 'indigo' }],
    },
  ];

  const colorMapping = {
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-500',
    green: 'text-green-500',
    red: 'text-red-400',
    blue: 'text-blue-400',
    teal: 'text-teal-300',
    amber: 'text-amber-400',
    gray: 'text-gray-500',
    '': 'text-gray-300',
  };

  return (
    <div className='p-4 max-w-full mx-auto'>
      <header className='text-center mb-6'>
        <h1 className='text-4xl font-bold text-violet-400'>
          Implement Queue using Stacks
        </h1>
        <p className='text-lg text-gray-400 mt-2'>Visualizing LeetCode 232</p>
      </header>

      <div className='bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6'>
        <div className='flex items-center gap-4 flex-grow'>
          <label
            htmlFor='commands-input'
            className='font-medium text-gray-300 font-mono'
          >
            Commands:
          </label>
          <input
            id='commands-input'
            type='text'
            value={commands}
            onChange={(e) => setCommands(e.target.value)}
            disabled={isLoaded}
            className='font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-violet-500'
          />
          <label
            htmlFor='args-input'
            className='font-medium text-gray-300 font-mono'
          >
            Args:
          </label>
          <input
            id='args-input'
            type='text'
            value={argsInput}
            onChange={(e) => setArgsInput(e.target.value)}
            disabled={isLoaded}
            className='font-mono bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-violet-500'
          />
        </div>
        <div className='flex items-center gap-2'>
          {!isLoaded ? (
            <button
              onClick={loadData}
              className='bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors'
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0}
                className='bg-gray-700 p-2 rounded-md disabled:opacity-50'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M11 19l-7-7 7-7m8 14l-7-7 7-7'
                  />
                </svg>
              </button>
              <span className='font-mono text-lg w-24 text-center'>
                {currentStep + 1}/{history.length}
              </span>
              <button
                onClick={stepForward}
                disabled={currentStep >= history.length - 1}
                className='bg-gray-700 p-2 rounded-md disabled:opacity-50'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M13 5l7 7-7 7M5 5l7 7-7 7'
                  />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={reset}
            className='ml-4 bg-red-600 hover:bg-red-700 text-white cursor-pointer font-bold py-2 px-4 rounded-lg shadow-md'
          >
            Reset
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50'>
          <h3 className='font-bold text-xl text-violet-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2'>
            <Code size={20} />
            C++ Solution
          </h3>
          <pre className='text-sm overflow-auto'>
            <code className='font-mono leading-relaxed'>
              {codeLines.map(({ num, content }) => (
                <div
                  key={num}
                  className={`block transition-all duration-300 rounded-md ${
                    line === num ? 'bg-violet-500/20' : ''
                  }`}
                >
                  <span className='text-gray-600 w-8 inline-block text-right pr-4 select-none'>
                    {num}
                  </span>
                  {content.map((token, index) => (
                    <span key={index} className={colorMapping[token.c]}>
                      {token.t}
                    </span>
                  ))}
                </div>
              ))}
            </code>
          </pre>
        </div>

        <div className='lg:col-span-2 space-y-6'>
          <div className='relative bg-gray-800/50 p-6 mb-12 rounded-xl border border-gray-700/50 shadow-2xl min-h-[180px]'>
            <h3 className='font-bold text-lg text-gray-300 mb-4'>Commands</h3>
            <div
              id='command-container'
              className='flex justify-center items-center gap-2 flex-wrap'
            >
              {commands.split(',').map((command, index) => (
                <div
                  key={index}
                  id={`command-container-element-${index}`}
                  className={`p-3 flex items-center justify-center text-xl font-bold rounded-lg transition-all duration-300 ${
                    i === index
                      ? 'bg-violet-500/40 border-violet-400'
                      : 'bg-gray-700/50'
                  }`}
                >
                  {command}
                </div>
              ))}
            </div>
            {isLoaded && (
              <VisualizerPointer
                index={i}
                containerId='command-container'
                color='red'
                label='⬆'
                direction='up'
              />
            )}
          </div>
          <div className='relative bg-gray-800/50 p-6 mb-12 rounded-xl border border-gray-700/50 shadow-2xl min-h-[180px]'>
            <h3 className='font-bold text-lg text-gray-300 mb-4'>Args</h3>
            <div
              id='arg-container'
              className='flex justify-center items-center gap-2 flex-wrap'
            >
              {argsInput.split(',').map((arg, index) => (
                <div
                  key={index}
                  id={`arg-container-element-${index}`}
                  className={`py-2 px-4 flex items-center justify-center text-xl font-bold rounded-lg transition-all duration-300 ${
                    i === index
                      ? 'bg-violet-500/40 border-violet-400'
                      : 'bg-gray-700/50'
                  }`}
                >
                  {arg}
                </div>
              ))}
            </div>
            {isLoaded && (
              <VisualizerPointer
                index={j}
                containerId='arg-container'
                color='orange'
                label='⬆'
                direction='up'
              />
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-gray-800/50 p-6 rounded-xl border border-gray-700/50'>
              <h3 className='font-bold text-lg text-violet-300 mb-3 flex items-center gap-2'>
                <Layers size={18} />
                Stack 1
              </h3>
              <div className='bg-gray-900/50 rounded-lg p-3 h-48 flex flex-col-reverse items-center gap-2 overflow-y-auto'>
                {stack1.map((val, idx) => (
                  <div
                    key={idx}
                    className='w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-violet-600 to-violet-500 rounded-lg font-mono text-xl shadow-lg'
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
            <div className='bg-gray-800/50 p-6 rounded-xl border border-gray-700/50'>
              <h3 className='font-bold text-lg text-violet-300 mb-3 flex items-center gap-2'>
                <Layers size={18} />
                Stack 2
              </h3>
              <div className='bg-gray-900/50 rounded-lg p-3 h-48 flex flex-col-reverse items-center gap-2 overflow-y-auto'>
                {stack2.map((val, idx) => (
                  <div
                    key={idx}
                    className='w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-violet-600 to-violet-500 rounded-lg font-mono text-xl shadow-lg'
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[6rem]'>
            <h3 className='font-bold text-sm text-gray-400 mb-2'>
              Explanation
            </h3>
            <p
              className='text-gray-300'
              dangerouslySetInnerHTML={{ __html: explanation }}
            />
          </div>
        </div>
      </div>
      <div className='mt-6 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50'>
        <h3 className='font-bold text-xl text-gray-400 mb-2'>Result</h3>
        <p className='text-green-300 text-2xl'>{result.join(', ')}</p>
      </div>
      <div className='mt-6 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50'>
        <h3 className='font-bold text-xl text-violet-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2'>
          <Clock size={20} /> Complexity Analysis
        </h3>
        <div className='space-y-4 text-sm text-gray-300'>
          <div>
            <h4 className='font-semibold text-violet-300'>
              Time Complexity:{' '}
              <span className='font-mono text-teal-300'>
                Push: O(N), Peek: O(1), Pop: O(1), Empty: O(1)
              </span>
            </h4>
          </div>
          <div>
            <h4 className='font-semibold text-violet-300'>
              Space Complexity:{' '}
              <span className='font-mono text-teal-300'>O(N)</span>
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueUsingStacks;
