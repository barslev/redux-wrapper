# Unified Redux Wrapper

### Description

A wrapper built around Redux to simplify the use of Redux which typically involves

- creating Actions,
- creating Action Creators,
- Setting up new Reducers to update slices of the Store,
- and finally dispatching Actions.

	This cycle needs to be repeated almost every time API requests are made, and essentially anytime the store needs to be updated.
	This wrapper reduces this verbosity using the same design pattern recommended by the Redux team, it abstracts the repetitive boilerplate involved with setting up new actions, action creators and reducers into a few easy steps.

## Problem Statement

The library solves the following problems peculiar to implementing state management using Redux.

- Verbosity: This wrapper abstracts all the boilerplates and exposes only a few steps.
- Error propensity: Unified Redux Wrapper limits the chances of errors when writing the multiple artifacts of conventional flux pattern. To update the store, if you have to create actions, action creators, reducers to manage the store for every API call to the back end, you could end up with a lot of unmanaged files where the propensity for introducing error is increased by the number of methods written. This library solves this problem by adopting a very cohesive design pattern where one reducer and one action creator can serve all actions for you.

	Unified Redux Wrapper is modular and highly cohesive, which makes your implementations highly extendable and maintainable. It does not limit you from implementing the conventional approach of Redux you are used to,
	you can use this approach simultaneously with whatever approach you are familiar with.
	This is not an extension to Redux, just an implementation of a design pattern that promotes cohesion.

### Documentation

- **Typically you will use two methods from this library, which are `setUpCombinedReducers` and `dispatchActions`**
- The `setUpCombinedReducers` combines your reducers (if any ) with those actions you wish to use with the library.

  You need to create a file that contains your actions, conventionally this file is called `actionDictionary.js`

- create a variable within this file like this

  `const actionDictionary = { }`

- add your actions (as Block cased keys and values separated by an underscore) e.g

```
 const actionDictionary = {
	MY_FIRST_ACTION: 'MY_FIRST_ACTION',
	MY_SECOND_ACTION: 'MY_SECOND_ACTION'
 }
```

- You can update this file when you want to add more items to your store

- these key/values within the objects become camel-cased in your store so they can be accessed as


    `myFirstAction and mySecondAction`

- When creating your store (as defined in the Redux docs) please follow the approach defined below


		import { createStore, applyMiddleware, compose } from "redux";
		import { setUpCombinedReducers } from "unified-redux-wrapper";
		import { actionDictionary } from "./actions/actionDictionary";
		// your defined action dictionary , could be located anywhere

		...

		const store = createStore(
		setUpCombinedReducers(actionDictionary),	// here we inject the reducers generated by the library
		initialState,	// you can pass any other base reducer not managed by Unified Redux Wrapper
		composedEnhancers,
		);

		export default store;

### Using the module in a React component

**When creating a component you import the library on the react component as below**,

The imported method (dispatchActions) serve as the singular action creator which you can use across the whole application, so it should be passed to mapDispatchToProps as :

```
import { dispatchActions} from 'unified-redux-wrapper'

```

**Implement mapDispatchToProps as**,

	const mapDispatchToProps = (dispatch) => {
		return bindActionCreators({
			dispatchActions: dispatchActions,  // other actions not dispatched by the module can be added as well
		}, dispatch);
	};


**Implement mapStateToProps as**,

	const mapStateToProps = ({myFirstAction, mySecondAction}) => ({
		myFirstActionPending: myFirstAction.pending 	// here is the pending state, it is false until an asynchronous dispatch is called - this is omited in synchronous action calls.
		myFirstActionPayload: myFirstAction.payload 	// contains payload returned by action.
		myFIrstActionError: myFirstAction.error 	// here is what happens when an error is encountered. Store is updated with the error.
	});


## Asynchronous updates

Typically each element in your store will have three states:

1.  **pending** : The pending state will be false initially. It is only present when updating your store with an asynchronous function and the function is being called. The state will be set to true and this is a very good time to add loaders or suspense to your application. When the pending state is true, the payload and the error state will be set to null, the action called during this state will be `REQUEST_<Your action>`
2.  **payload**: After the pending state is called and the asynchronous call returns a value, the variable will have a payload state set to the value of the returned object while pending state and error state will be set to null. At this state, the action will be `RECIEVE_<Your action>`
3.  **error**: if the asynchronous/synchronous call errors out then the error state will be set to the description of the error encountered, otherwise it is null/false, the action at this state will be `FAIL_<Your action>`

## Synchronous updates

For synchronous updates all the above are true asides from there will be **no pending state**


## Using the Action Creator

The actionCreator requires the following parameters for dispatch

1. **dictKey**: This is the value representing the store item you wish to update , referring to our example this will be `'MY_FIRST_STORE'`
2. **eventAction**: This is a method/values representing the action you want to call or update respectively, typically it could be an API call, for instance, if I have a function that calls my endpoint called `callEndPoint`.
This method will be passed as a variable to the function. For synchronous request, this could be a function that returns values, or the values with which we wish to update the store by.
3. **isAsync**: it is true for asynchronous requests and false for synchronous request
4. **parameter**: if the event action is a method that requires parameters, please pass an array of this parameter in the order they are called within the method to this variable, if not pass an empty array
5. **actionDictionary**: You should pass the action dictionary as the last parameter

To call the dispatchActions within your components

for asynchronous calls

        this.props.dispatchActions(<dictKey>, <eventAction>, true, [<url>, <anyotherparam>], <actionDictionary>)

for synchronous calls

        this.props.dispatchActions(<dictKey>, <eventAction>, false, [<anyparam for functions>], <actionDictionary>)

- you can pass in functions, promises, or objects as a parameter to the dispatch actions


**Example**

	import { actionDictionary } from '../../actions/actionDictionary';

	class Reporting extends Component {

	handleTestStore = (inputValue) => {
		const { dispatchActions } = this.props;
		dispatchActions("MY_FIRST_STORE", inputValue, false, [], actionDictionary);
	}

	render() {
		return (
			<ReportFilters />
			<div className="btn-container">
			<Input type="text" onChange={(e) => this.handleTestStore(e.target.value)} />
