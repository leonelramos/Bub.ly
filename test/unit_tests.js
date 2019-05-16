/**
 * Lightweight testing suite for developers who want to test quiqly
 * Will add functionality over time, will make node friendly version soon
 * @author Leonel Ramos
 */
 
 let tests = new Map();

/**
 * Runs all the currently existing tests
 */
function run_tests()
{
    tests.forEach((__, test_name) => {
        run_test(test_name);
    });
}

/**
 * Run a single test
 * @param {string} test_name name of test to run 
 */
function run_test(test_name)
{
    let test = tests.get(test_name);
    test_unit(test.fn, test.input, test.expected_output);
}

/**
 * Takes a function with input and compares it to expected output.
 * @param {function} fn function to test
 * @param {*} input input for the function
 * @param {*} expected_output expected output of the function
 */
function test_unit(fn, input, expected_output) 
{
    let actual_output = fn(...input);
    if(actual_output === expected_output) console.log(`SUCCESS: ${fn.name} returned expected output`);
    else console.log(`FAILURE: ${fn.name} returned ${actual_output}. Expected output: ${expected_output}`);
}

/**
 * Adds a test with input and its expected output
 * @param {string} test_name the tests name
 * @param {function} fn function to test
 * @param {*} input input for the function
 * @param {*} expected_output expected output of the function
 */
function add_test(test_name, fn, input, expected_output)
{
    tests.set(`${test_name}`, {fn: fn, input: input, expected_output: expected_output});
}

/**
 * Updates an existing test with a new function, input, and expected output
 * @param {string} test_name the tests name
 * @param {function} fn update function
 * @param {*} input updated input for the function
 * @param {*} expected_output updated expected output of the function
 */
function update_test(test_name, new_fn, new_input, new_expected_output)
{
    add_test(test_name, new_fn, new_input, new_expected_output);
}

/**
 * Deletes the test with the given name if it exists
 * @param {string} test_name name of test to delete
 */
function delete_test(test_name)
{
    tests.delete(test_name);
}