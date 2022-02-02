fdescribe('Async testing examples', () => {
  it('Asynchronous test example with jamine done()', (done: DoneFn) => {
    let test = false;
    setTimeout(() => {
      test = true;
      expect(test).toBeTruthy();
      done();
    }, 1000);
  });
});
