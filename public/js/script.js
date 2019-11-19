(function() {
    Vue.component("first-component", {
        template: "#template",
        data: function() {
            return {
                info: [],
                username: "",
                url: "",
                title: "",
                created_at: "",
                description: "",
                comments: [],
                comments_username: "",
                comment: "",
                error: false,
                nextId: "",
                lastId: ""
            };
        },
        props: ["selectedImage", "afterDelete"],
        mounted: function() {
            this.getInfo();
        },
        watch: {
            selectedImage: function() {
                this.getInfo();
            },
            nextId: function() {
                this.getInfo();
            },
            lastId: function() {
                this.getInfo();
            }
        },
        methods: {
            getInfo: function() {
                axios
                    .get(`/images/${this.selectedImage}`)
                    .then(
                        function(res) {
                            if (res.data.info) {
                                this.nextId = res.data.nextId;
                                this.lastId = res.data.lastId;
                                this.info = res.data.info;

                                this.comments = res.data.comments || [];
                            } else {
                                this.$emit("close");
                            }
                            addEventListener("keydown", e => {
                                if (e.keyCode == 27) {
                                    this.$emit("close");
                                }
                                if (e.keyCode == 37) {
                                    console.log(this.lastId);
                                    location.hash = `${this.lastId}`;
                                }
                                if (e.keyCode == 39) {
                                    location.hash = `${this.nextId}`;
                                }
                            });
                        }.bind(this)
                    )
                    .catch(err => console.log(err));
            },
            closeModal: function() {
                this.$emit("close");
            },
            deleteImage: function() {
                var myVue = this;
                axios
                    .post(`/delete/${this.selectedImage}`)
                    .then(res => {
                        myVue.$emit("empty", res.data);
                    })
                    .then(() => myVue.$emit("close"));
            },

            submit: function() {
                let comment = {
                    id: this.selectedImage,
                    comments_username: this.comments_username,
                    comment: this.comment
                };

                axios
                    .post("/comment", comment)
                    .then(
                        function(res) {
                            if (
                                res.data.comments_username === "" ||
                                res.data.comment === ""
                            ) {
                                this.error = true;
                            } else {
                                this.comments.unshift(res.data);
                            }
                        }.bind(this)
                    )
                    .catch(() => (this.error = true));
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            images: [],
            username: "",
            title: "",
            desc: "",
            file: null,
            error: false,
            selectedImage: location.hash.slice(1),
            showButton: true
        },
        mounted: function() {
            console.log("mounted");
            var myVue = this;
            axios.get("/images").then(function(res) {
                console.log(res.data);
                myVue.images = res.data;
                if (myVue.images.length === 10) {
                    // myVue.showButton = false;
                }
            });
            addEventListener("hashchange", function() {
                myVue.selectedImage = location.hash.slice(1);
            });
        },
        created: function() {
            console.log("created");
        },
        updated: function() {
            console.log("updated");
            console.log(this.images);
        },
        methods: {
            upload: function() {
                var myVue = this;
                var fd = new FormData();
                fd.append("image", this.file);
                fd.append("username", this.username);
                fd.append("title", this.title);
                fd.append("desc", this.desc);
                axios
                    .post("/upload", fd)
                    .then(function(res) {
                        console.log("this is uploadafter", res.data);
                        if (
                            res.data.title === "" ||
                            res.data.username === "" ||
                            res.data.description === ""
                        ) {
                            myVue.error = true;
                        } else {
                            myVue.images.unshift(res.data);
                        }
                    })
                    .catch(() => (myVue.error = true));
            },
            moreImages: function() {
                var myVue = this;
                var lastId = myVue.images[myVue.images.length - 1].id;

                axios.get(`/moreimages/${lastId}`).then(res => {
                    for (let i = 0; i < res.data.rows.length; i++) {
                        if (
                            res.data.rows[i].id === res.data.rows[i].lowest_id
                        ) {
                            myVue.showButton = false;
                        }
                        myVue.images.push(res.data.rows[i]);
                    }
                });
            },
            fileSelected: function(e) {
                this.file = e.target.files[0];
            },
            closeMe: function() {
                this.selectedImage = false;
                location.hash = "";
                history.replaceState(null, null, " ");
            },
            emptyImages: function(afterDelete) {
                var myVue = this;

                myVue.images = afterDelete;
            }
        }
    });
})();
