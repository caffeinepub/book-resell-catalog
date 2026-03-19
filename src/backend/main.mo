import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  // Components
  include MixinStorage();

  let books = Map.empty<Text, Book>();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profiles
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Custom Types
  type BookCondition = { #new; #good; #fair };

  type Book = {
    id : Text;
    title : Text;
    author : Text;
    description : Text;
    condition : BookCondition;
    price : Text;
    imageId : ?Text;
    createdAt : Time.Time;
  };

  module Book {
    public func compare(book1 : Book, book2 : Book) : Order.Order {
      Text.compare(book1.id, book2.id);
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Book Management
  public shared ({ caller }) func addBook(id : Text, title : Text, author : Text, description : Text, condition : BookCondition, price : Text, imageId : ?Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add books");
    };

    if (books.containsKey(id)) {
      Runtime.trap("Book with this ID already exists");
    };

    let newBook : Book = {
      id;
      title;
      author;
      description;
      condition;
      price;
      imageId;
      createdAt = Time.now();
    };

    books.add(id, newBook);
  };

  public shared ({ caller }) func updateBook(id : Text, title : Text, author : Text, description : Text, condition : BookCondition, price : Text, imageId : ?Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update books");
    };

    switch (books.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?existingBook) {
        let updatedBook : Book = {
          id;
          title;
          author;
          description;
          condition;
          price;
          imageId;
          createdAt = existingBook.createdAt;
        };
        books.add(id, updatedBook);
      };
    };
  };

  public shared ({ caller }) func deleteBook(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete books");
    };

    switch (books.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?_) {
        books.remove(id);
      };
    };
  };

  // Public Queries
  public query func getBook(id : Text) : async Book {
    switch (books.get(id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };
  };

  public query func listBooks() : async [Book] {
    books.values().toArray().sort();
  };

  // Seed Data
  public shared ({ caller }) func seedBooks() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can seed books");
    };

    let sampleBooks = [
      {
        id = "01";
        title = "The Secret";
        author = "Rhonda Byrne";
        description = "A self-help book revealing the law of attraction and how positive thinking can transform your life.";
        condition = #new;
        price = "Rs. 160";
        imageId = ?"https://drive.google.com/uc?export=view&id=172PXRafsWSRZ4VKUpKBsthSRYG2ROG-p";
        createdAt = Time.now();
      },
      {
        id = "02";
        title = "The Art of Living Alone";
        author = "Tanveer Farooqi";
        description = "A thoughtful guide to embracing solitude and finding peace within yourself.";
        condition = #new;
        price = "Rs. 170";
        imageId = ?"https://drive.google.com/uc?export=view&id=1lIRDo6dMCHvMRLFmK5uFqPvn7UvZSPBN";
        createdAt = Time.now();
      },
      {
        id = "03";
        title = "Ikigai";
        author = "Héctor García & Francesc Miralles";
        description = "The Japanese secret to a long and happy life — finding your purpose and reason for being.";
        condition = #new;
        price = "Rs. 155";
        imageId = ?"https://drive.google.com/uc?export=view&id=18eF-4GzkR5UV3YCaVojuWPanmDtjGg-o";
        createdAt = Time.now();
      },
      {
        id = "04";
        title = "White Nights";
        author = "Fyodor Dostoevsky";
        description = "A tender and melancholic short novel about a lonely dreamer who falls in love during four magical nights in St. Petersburg.";
        condition = #new;
        price = "Rs. 110";
        imageId = ?"https://drive.google.com/uc?export=view&id=1AggUdqZNaiK6xVzJC4hZbEmFbX9y78-L";
        createdAt = Time.now();
      },
      {
        id = "05";
        title = "Jaun Elia: Ghazab Shayar";
        author = "Jaun Elia";
        description = "A collection of Urdu ghazals by the legendary poet Jaun Elia — raw, rebellious, and deeply emotional.";
        condition = #new;
        price = "Rs. 125";
        imageId = ?"https://drive.google.com/uc?export=view&id=1lBpU6_AZjd0G7AfDCVRvICTDi93QD3Zp";
        createdAt = Time.now();
      },
      {
        id = "06";
        title = "Mein Te Mein";
        author = "Shiv Kumar Batalvi";
        description = "Iconic Punjabi poetry by Shiv Kumar Batalvi — verses filled with longing, love, and the ache of separation.";
        condition = #new;
        price = "Rs. 155";
        imageId = ?"https://drive.google.com/uc?export=view&id=1KUa9NvuYqDJVwOeF_9qqxROcbrz4Gt5h";
        createdAt = Time.now();
      },
      {
        id = "07";
        title = "Asa Ta Joban Rutte Marna";
        author = "Shiv Kumar Batalvi";
        description = "Passionate Punjabi poetry by Batalvi capturing the beauty and pain of youth and love.";
        condition = #new;
        price = "Rs. 160";
        imageId = ?"https://drive.google.com/uc?export=view&id=1wp9A-CRHPm216rkef58Wj1xXZ-Rnhry6";
        createdAt = Time.now();
      },
      {
        id = "08";
        title = "Chali Din";
        author = "Dr. Gurpreet Singh Dhugga";
        description = "An inspirational Punjabi novel about transformation, resilience, and the power of forty days.";
        condition = #new;
        price = "Rs. 180";
        imageId = ?"https://drive.google.com/uc?export=view&id=1z0uuSY3SbkPDWR5AlzMpHTiTlcn9W5al";
        createdAt = Time.now();
      },
      {
        id = "09";
        title = "To Kill a Mockingbird";
        author = "Harper Lee";
        description = "A Pulitzer Prize-winning masterpiece about racial injustice and moral growth in the American South.";
        condition = #new;
        price = "Rs. 350";
        imageId = ?"https://drive.google.com/uc?export=view&id=1Rl2DbA8j9NqK1R_LLpsRt2oj8JvyEB8y";
        createdAt = Time.now();
      },
      {
        id = "10";
        title = "Atomic Habits";
        author = "James Clear";
        description = "A practical guide to building good habits and breaking bad ones through small, consistent changes.";
        condition = #new;
        price = "Rs. 350";
        imageId = ?"https://drive.google.com/uc?export=view&id=1-qkYgAnF0MBDjqS7CrXQbL7Ytj_Tgj7p";
        createdAt = Time.now();
      },
    ];

    for (book in sampleBooks.values()) {
      books.add(book.id, book);
    };
  };
};
