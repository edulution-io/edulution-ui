import {Survey} from '@/pages/Surveys/Subpages/components/types/survey';

const mockedSurveys: Survey[] = [
  {
    surveyname: "20240603115865168",
    survey: JSON.stringify({
      "title": "NPS Survey Question",
      "pages": [
        {
          "name": "page1",
          "elements": [
            {
              "type": "rating",
              "name": "nps_score",
              "title": "On a scale of zero to ten, how likely are you to recommend our product to a friend or colleague?",
              "isRequired": true,
              "rateCount": 11,
              "rateMin": 0,
              "rateMax": 10,
              "minRateDescription": "(Most unlikely)",
              "maxRateDescription": "(Most likely)"
            },
          ]
        }
      ],
      "showQuestionNumbers": "off"
    }),
    participants: [{
      label: "agy-netzint-teacher",
      value: "agy-netzint-teacher",
      username: "agy-netzint-teacher"
    }, {
      label: "agy-netzint-student",
      value: "agy-netzint-student",
      username: "agy-netzint-student"
    }, {
      label: "agy-netzint1",
      value: "agy-netzint1",
      username: "agy-netzint1"
    }, {
      label: "agy-netzint2",
      value: "agy-netzint2",
      username: "agy-netzint2"
    }],
    saveNo: 5,
    created: new Date(),
    isAnonymous: true,
    canSubmitMultipleAnswers: true,
  },
  {
    surveyname: "20240603115865168",
    survey: JSON.stringify({
      "title": "NPS Survey Question",
      "completedHtml": "<h3>Thank you for your feedback</h3>",
      "completedHtmlOnCondition": [
        {
          "expression": "{nps_score} >= 9",
          "html": "<h3>Thank you for your feedback</h3> <h4>We are glad that you love our product. Your ideas and suggestions will help us make it even better.</h4>"
        },
        {
          "expression": "{nps_score} >= 6  and {nps_score} <= 8",
          "html": "<h3>Thank you for your feedback</h3> <h4>We are glad that you shared your ideas with us. They will help us make our product better.</h4>"
        }
      ],
      "pages": [
        {
          "name": "page1",
          "elements": [
            {
              "type": "rating",
              "name": "nps_score",
              "title": "On a scale of zero to ten, how likely are you to recommend our product to a friend or colleague?",
              "isRequired": true,
              "rateCount": 11,
              "rateMin": 0,
              "rateMax": 10,
              "minRateDescription": "(Most unlikely)",
              "maxRateDescription": "(Most likely)"
            },
            {
              "type": "checkbox",
              "name": "promoter_features",
              "visibleIf": "{nps_score} >= 9",
              "title": "Which of the following features do you value the most?",
              "description": "Please select no more than three features.",
              "isRequired": true,
              "validators": [
                {
                  "type": "answercount",
                  "text": "Please select no more than three features.",
                  "maxCount": 3
                }
              ],
              "choices": [
                "Performance",
                "Stability",
                "User interface",
                "Complete functionality",
                "Learning materials (documentation, demos, code examples)",
                "Quality support"
              ],
              "showOtherItem": true,
              "otherText": "Other features:",
              "colCount": 2
            },
            {
              "type": "comment",
              "name": "passive_experience",
              "visibleIf": "{nps_score} >= 7  and {nps_score} <= 8",
              "title": "What can we do to make your experience more satisfying?"
            },
            {
              "type": "comment",
              "name": "disappointing_experience",
              "visibleIf": "{nps_score} <= 6",
              "title": "Please let us know why you had such a disappointing experience with our product"
            }
          ]
        }
      ],
      "showQuestionNumbers": "off"
    }),
    participants: [{
      label: "agy-netzint-teacher",
      value: "agy-netzint-teacher",
      username: "agy-netzint-teacher"
    }, {
      label: "agy-netzint-student",
      value: "agy-netzint-student",
      username: "agy-netzint-student"
    }, {
      label: "agy-netzint1",
      value: "agy-netzint1",
      username: "agy-netzint1"
    }, {
      label: "agy-netzint2",
      value: "agy-netzint2",
      username: "agy-netzint2"
    }],
    saveNo: 15,
    created: new Date(),
    isAnonymous: true,
    canSubmitMultipleAnswers: true,
  },
]

export default mockedSurveys;
