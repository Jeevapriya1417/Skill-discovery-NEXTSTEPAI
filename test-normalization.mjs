
function normalizeQuestions(questions) {
  if (Array.isArray(questions)) {
    return questions.map((q) => {
      if (q.type === 'mcq' && q.options) {
        // If options is an array of objects like [{A: '...'}, {B: '...'}] or {A: '...', B: '...'}
        if (Array.isArray(q.options) && q.options.length > 0 && typeof q.options[0] === 'object') {
          const firstObj = q.options[0];
          q.options = [firstObj.A, firstObj.B, firstObj.C, firstObj.D].filter(Boolean);
        } else if (!Array.isArray(q.options) && typeof q.options === 'object') {
          q.options = [q.options.A, q.options.B, q.options.C, q.options.D].filter(Boolean);
        }
        
        // Final fallback: ensure it's an array of strings
        if (!Array.isArray(q.options)) {
          q.options = [];
        } else {
          q.options = q.options.map((opt) => String(opt));
        }
      } else if (q.type === 'mcq' && !q.options) {
        q.options = [];
      }
      return q;
    });
  }
  return questions;
}

const testCases = [
  {
    name: 'Array of objects format (as seen in error)',
    input: [
      {
        question: 'What is x?',
        type: 'mcq',
        options: [
          {
            A: 'var x = 10;',
            B: 'let x = 10;',
            C: 'const x = 10;',
            D: 'All of the above'
          }
        ]
      }
    ],
    expected: ['var x = 10;', 'let x = 10;', 'const x = 10;', 'All of the above']
  },
  {
    name: 'Object format',
    input: [
      {
        question: 'What is y?',
        type: 'mcq',
        options: {
          A: '1',
          B: '2',
          C: '3',
          D: '4'
        }
      }
    ],
    expected: ['1', '2', '3', '4']
  },
  {
    name: 'Correct array format',
    input: [
      {
        question: 'What is z?',
        type: 'mcq',
        options: ['A', 'B', 'C', 'D']
      }
    ],
    expected: ['A', 'B', 'C', 'D']
  }
];

testCases.forEach(tc => {
  const result = normalizeQuestions(tc.input);
  const actualOptions = result[0].options;
  const passed = JSON.stringify(actualOptions) === JSON.stringify(tc.expected);
  console.log(`${tc.name}: ${passed ? 'PASSED' : 'FAILED'}`);
  if (!passed) {
    console.log('  Expected:', tc.expected);
    console.log('  Actual:', actualOptions);
  }
});
