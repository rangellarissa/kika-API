import { createServer } from 'http';
import { readFile } from 'fs';

const server = createServer((req, res) => {
  // Set the content type to JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Read the contents of the JSON file
  readFile('example.json', 'utf8', (err, data) => {
    if (err) {
      // Handle any errors that occur while reading the file
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Internal server error' }));
      return;
    }

    // Return the contents of the JSON file as the response
    res.end(data);
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
