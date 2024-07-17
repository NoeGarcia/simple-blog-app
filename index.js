import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import multer from 'multer';

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        // Set the filename to be original name or generate a unique name
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join('views'));

// In-memory storage for posts
const posts = [
    { id: 1, title: "Sample Post 1", content: "This is a sample post showing a cat.", image: "/images/cat.jpg", date: new Date(), author: "user1" },
    { id: 2, title: "Sample Post 2", content: "This is another sample post from London.", image: "/images/london.jpg", date: new Date(), author: "user2" },
    { id: 3, title: "Sample Post 3", content: "This is yet another sample post to show that in large messages a \"Continue reading\" button appears and redirects to another view page to show the full content.", image: "/images/soccer.jpg", date: new Date(), author: "user3" }
];

// Routes
app.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const postsPerPage = 6;
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = page * postsPerPage;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    res.render('index', {
        posts: paginatedPosts,
        currentPage: page,
        totalPages: Math.ceil(posts.length / postsPerPage)
    });
});

// Display the form for creating a new post
app.get('/new', (req, res) => {
    res.render('new');
});

// Handle the form submission for creating a new post
app.post('/add', upload.single('image'), (req, res) => {
    const { title, content, author } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null; // Use the path to the image file
    const newPost = {
        id: posts.length + 1,
        title,
        content,
        image,
        date: new Date(),
        author
    };
    posts.push(newPost);
    res.redirect('/');
});

// View a single post
app.get('/post/:id', (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    if (post) {
        res.render('post', { post });
    } else {
        res.redirect('/');
    }
});

app.get('/edit/:id', (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    if (post) {
        res.render('edit', { post });
    } else {
        res.redirect('/');
    }
});

app.post('/edit/:id', (req, res) => {
    const { title, content} = req.body;
    const image = req.body.image ? `/images/${req.body.image}` : null; // Use the path to the image file
    const post = posts.find(p => p.id == req.params.id);
    if (post) {
        post.title = title;
        post.content = content;
        post.image = image;
    }
    res.redirect('/');
});

app.get('/delete/:id', (req, res) => {
    const postIndex = posts.findIndex(p => p.id == req.params.id);
    if (postIndex !== -1) {
        posts.splice(postIndex, 1);
    }
    res.redirect('/');
});

// Start server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});