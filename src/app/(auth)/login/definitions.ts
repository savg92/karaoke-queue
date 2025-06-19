// This file defines the shape of the state object for the login form.
// Using a dedicated type definition ensures consistency between the server action
// and the client component that uses it.

export type FormState = {
	message: string;
	errors: {
		email?: string[];
		_form?: string[];
	};
};
